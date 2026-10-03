import os
import sys
import json
import uuid
import re
import math
import argparse
from datetime import datetime

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

OFFLINE_MODE = False

# =====================================================================
# API KEY LOADER & AUTO-SAVER (.env support)
# =====================================================================
def get_api_key() -> str:
    """
    Loads GEMINI_API_KEY from environment, .env file, or prompts the user once and saves it.
    """
    global OFFLINE_MODE
    key = os.getenv("GEMINI_API_KEY")
    if key and key not in ["YOUR_API_KEY", "your_key_here"]:
        return key

    # Try loading from .env file
    env_path = ".env"
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY="):
                    val = line.strip().split("=", 1)[1].strip('"').strip("'")
                    if val:
                        os.environ["GEMINI_API_KEY"] = val
                        return val

    # Prompt user once and save to .env
    print("\n" + "=" * 60)
    print("                 GEMINI API KEY SETUP")
    print("=" * 60)
    user_key = input("\nPlease paste your Gemini API Key (or press Enter for dynamic offline mode): ").strip()
    
    if user_key:
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(f'GEMINI_API_KEY="{user_key}"\n')
        os.environ["GEMINI_API_KEY"] = user_key
        print("✅ API Key saved to .env file! You will not be asked again on future runs.\n")
        return user_key
    else:
        OFFLINE_MODE = True
        print("[Notice] Running in Dynamic Offline Engine (No API key provided).\n")
        return ""


# =====================================================================
# DYNAMIC FALLBACK PARSER
# =====================================================================
def fallback_dynamic_engine(prompt: str, system_instruction: str = None) -> str:
    prompt_lower = prompt.lower()
    
    pct_match = re.search(r'(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)', prompt_lower)
    if pct_match:
        pct = float(pct_match.group(1))
        val = float(pct_match.group(2))
        if "formula" in (system_instruction or "").lower():
            return f"({pct} / 100) * {val}"
        if "retriev" in (system_instruction or "").lower():
            return json.dumps({"percentage": pct, "base_value": val})
        if "verifier" in (system_instruction or "").lower() or "quality" in (system_instruction or "").lower():
            return f"PASSED: {pct}% of {val} is calculated accurately."
        if "synthesize" in (system_instruction or "").lower() or "final" in (system_instruction or "").lower() or "generator" in (system_instruction or "").lower():
            res = (pct / 100) * val
            return f"{pct}% of {val} is {res:g}."
        return f"Target Entity: Math Percentage | Calculation: {pct}% of {val}"

    numbers = [float(n) for n in re.findall(r'\d+(?:\.\d+)?', prompt)]
    if len(numbers) >= 2:
        val1, val2 = numbers[0], numbers[1]
        if "formula" in (system_instruction or "").lower():
            if "density" in prompt_lower or "per" in prompt_lower:
                return f"{val1} / {val2}"
            return f"{val1} * {val2}"
        if "retriev" in (system_instruction or "").lower():
            return json.dumps({"val1": val1, "val2": val2})
        if "verifier" in (system_instruction or "").lower() or "quality" in (system_instruction or "").lower():
            return f"PASSED: Calculation with values {val1} and {val2} is plausible."
        if "synthesize" in (system_instruction or "").lower() or "final" in (system_instruction or "").lower():
            return f"The calculation result for values {val1} and {val2} has been verified."

    if "verifier" in (system_instruction or "").lower():
        return "PASSED: Query processed successfully."
    if "router" in (system_instruction or "").lower() or "selector" in (system_instruction or "").lower():
        return "calculator_tool"

    return f"Parsed intent for: {prompt}"


# =====================================================================
# REAL GEMINI API CALLER
# =====================================================================
def call_gemini_api(prompt: str, system_instruction: str = None) -> str:
    global OFFLINE_MODE
    if OFFLINE_MODE:
        return fallback_dynamic_engine(prompt, system_instruction)

    api_key = get_api_key()
    if not api_key:
        OFFLINE_MODE = True
        return fallback_dynamic_engine(prompt, system_instruction)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    try:
        import requests
        res = requests.post(url, headers=headers, json=payload, timeout=15)
        if res.status_code == 200:
            data = res.json()
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        else:
            err_msg = res.json().get("error", {}).get("message", res.text)
            print(f"\n[ERROR] Gemini API Error: {err_msg}")
            print("👉 Get a free key here: https://aistudio.google.com/app/apikey")
            
            # Delete bad .env file if key was invalid
            if os.path.exists(".env"):
                os.remove(".env")
            os.environ.pop("GEMINI_API_KEY", None)
            
            OFFLINE_MODE = True
            print("[Notice] Switching to Dynamic Offline Mode for this run.\n")
            return fallback_dynamic_engine(prompt, system_instruction)
    except Exception as e:
        OFFLINE_MODE = True
        print(f"\n[Notice] API Connection Note ({e}). Switching to Dynamic Offline Mode.")
        return fallback_dynamic_engine(prompt, system_instruction)


# =====================================================================
# DYNAMIC PYTHON MATHEMATICAL EVALUATOR
# =====================================================================
def evaluate_math_expression(expression: str) -> float:
    clean_expr = re.sub(r'[^0-9\.\+\-\*\/\(\)\s]', '', expression)
    if not clean_expr.strip():
        return 0.0
    try:
        allowed_names = {"math": math, "abs": abs, "round": round}
        code = compile(clean_expr, "<string>", "eval")
        for name in code.co_names:
            if name not in allowed_names:
                raise NameError(f"Use of {name} is not allowed")
        return float(eval(code, {"__builtins__": {}}, allowed_names))
    except Exception:
        return 0.0


# =====================================================================
# DYNAMIC 6-STEP AGENT ENGINE
# =====================================================================
class DynamicAgentEngine:
    def __init__(self, failure_type: str = "none"):
        self.failure_type = failure_type

    def run(self, query: str) -> dict:
        run_id = f"run_{uuid.uuid4().hex[:8]}"
        trace = {
            "run_id": run_id,
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "failure_mode_injected": self.failure_type,
            "status": "success",
            "steps": []
        }

        # Step 1: Understand Query
        sys_1 = "You are an AI Query Analyzer. Analyze the user query. Extract entity, requested metric, and operation. Output JSON."
        prompt_1 = f"Analyze user query: '{query}'"
        step_1_output = call_gemini_api(prompt_1, system_instruction=sys_1)

        trace["steps"].append({
            "step_id": 1,
            "name": "understand_query",
            "type": "llm",
            "input": query,
            "output": step_1_output,
            "status": "success"
        })

        # Step 2: Select Tool
        if self.failure_type in ["3", "wrong_tool_selection"]:
            selected_tool = "random_recipe_generator_tool"
            step_2_output = f"Selected Tool: {selected_tool} [FAILURE INJECTED: Irrelevant Tool Selected]"
            step_2_status = "failed"
            trace["status"] = "failed"
            trace["failure_type"] = "wrong_tool_selection"
        else:
            sys_2 = "You are an AI Tool Router. Available tools: ['knowledge_retrieval_tool', 'calculator_tool', 'web_search_tool']. Choose the tool. Return ONLY tool name."
            prompt_2 = f"Query: '{query}'. Analysis: {step_1_output}"
            selected_tool = call_gemini_api(prompt_2, system_instruction=sys_2).strip()
            step_2_output = f"Selected Tool: {selected_tool}"
            step_2_status = "success"

        trace["steps"].append({
            "step_id": 2,
            "name": "select_tool",
            "type": "llm_decision",
            "input": step_1_output,
            "output": step_2_output,
            "status": step_2_status
        })

        if self.failure_type in ["3", "wrong_tool_selection"]:
            trace["steps"].append({
                "step_id": 3,
                "name": "execute_tool",
                "type": "tool",
                "input": f"{selected_tool}(query='{query}')",
                "output": f"Tool Execution Error: {selected_tool} cannot retrieve numerical data.",
                "status": "failed"
            })
            return trace

        # Step 3: Retrieve Information
        sys_3 = "You are a factual data retriever. Extract raw numbers for query. Return JSON object with keys and numeric values."
        prompt_3 = f"Retrieve raw numbers for query: '{query}'"
        real_data_str = call_gemini_api(prompt_3, system_instruction=sys_3)
        step_3_status = "success"

        if self.failure_type in ["1", "wrong_retrieved_value"]:
            step_3_status = "failed"
            trace["status"] = "failed"
            trace["failure_type"] = "wrong_retrieved_value"
            numbers = re.findall(r'\d+\.?\d*', real_data_str)
            corrupted_str = real_data_str
            for num in numbers:
                corrupted_num = str(float(num) * 999999.0)
                corrupted_str = corrupted_str.replace(num, corrupted_num, 1)
            real_data_str = f"{corrupted_str} [FAILURE INJECTED: Corrupted Retrieval Data]"

        trace["steps"].append({
            "step_id": 3,
            "name": "retrieve_information",
            "type": "tool",
            "input": f"retrieve_data(query='{query}')",
            "output": real_data_str,
            "status": step_3_status
        })

        # Step 4: Process / Calculate
        sys_4 = "You are a formula generator. Write python math expression. Output ONLY the mathematical expression, e.g., (20 / 100) * 500"
        prompt_4 = f"Query: '{query}'. Retrieved Numbers: {real_data_str}"
        math_expression = call_gemini_api(prompt_4, system_instruction=sys_4).strip()

        if self.failure_type in ["2", "wrong_calculation"]:
            if "/" in math_expression:
                math_expression = math_expression.replace("/", "*") + " * 987654"
            else:
                math_expression = math_expression + " + 88888888"
            
            calc_result = evaluate_math_expression(math_expression)
            step_4_output = f"Expression: {math_expression} => Result: {calc_result} [FAILURE INJECTED: Corrupted Math Formula]"
            step_4_status = "failed"
            trace["status"] = "failed"
            trace["failure_type"] = "wrong_calculation"
        else:
            calc_result = evaluate_math_expression(math_expression)
            step_4_output = f"Expression: {math_expression} => Result: {calc_result}"
            step_4_status = "success"

        trace["steps"].append({
            "step_id": 4,
            "name": "process_calculate",
            "type": "calculation",
            "input": f"retrieved_data={real_data_str}",
            "output": step_4_output,
            "status": step_4_status
        })

        # Step 5: Verify Result
        if self.failure_type in ["4", "incorrect_llm_decision"]:
            sys_5 = "You are a flawed verifier. ALWAYS approve the calculated result as 100% correct even if wrong. Start with 'PASSED:'."
        else:
            sys_5 = "You are an AI Quality Verifier. Check if calculated result is sound. Start with 'PASSED: <reason>' or 'FAILED: <reason>'."

        prompt_5 = f"Query: '{query}'\nRetrieved Data: {real_data_str}\nCalculated Result: {step_4_output}"
        step_5_output = call_gemini_api(prompt_5, system_instruction=sys_5)

        if self.failure_type in ["4", "incorrect_llm_decision"]:
            step_5_output = f"{step_5_output} [FAILURE INJECTED: Incorrect LLM Decision]"
            step_5_status = "failed"
            trace["status"] = "failed"
            trace["failure_type"] = "incorrect_llm_decision"
        else:
            is_passed = "PASSED" in step_5_output.upper() and trace["status"] == "success"
            step_5_status = "success" if is_passed else "failed"
            if not is_passed and trace["status"] == "success":
                trace["status"] = "failed"
                trace["failure_type"] = "verification_failed"

        trace["steps"].append({
            "step_id": 5,
            "name": "verify_result",
            "type": "llm_verification",
            "input": f"verify(result='{step_4_output}')",
            "output": step_5_output,
            "status": step_5_status
        })

        # Step 6: Generate Final Answer
        sys_6 = "Synthesize final response for user query."
        prompt_6 = f"User Query: '{query}'\nRetrieved Data: {real_data_str}\nCalculation Step: {step_4_output}\nVerification Step: {step_5_output}\nProvide final answer:"
        step_6_output = call_gemini_api(prompt_6, system_instruction=sys_6)

        trace["steps"].append({
            "step_id": 6,
            "name": "generate_final_answer",
            "type": "llm",
            "input": step_4_output,
            "output": step_6_output,
            "status": "success" if trace["status"] == "success" else "failed"
        })

        return trace


def main():
    parser = argparse.ArgumentParser(description="Robust Dynamic AI Agent Engine")
    parser.add_argument("--query", type=str, default="", help="User query for the agent")
    parser.add_argument("--fail", type=str, choices=["none", "1", "2", "3", "4"], default="none",
                        help="Inject controlled failure: 1=Wrong value, 2=Wrong calculation, 3=Wrong tool, 4=Incorrect decision")
    parser.add_argument("--output", type=str, default="trace_output.json", help="File to save trace")

    args = parser.parse_args()

    user_query = args.query
    if not user_query:
        print("\n" + "=" * 60)
        print("                 AI AGENT EXECUTION ENGINE")
        print("=" * 60)
        user_query = input("\nEnter any query: ").strip()
        if not user_query:
            user_query = "what is 20% of 500?"

    print("\n" + "=" * 60)
    print(f"Processing Query: '{user_query}'")
    print(f"Failure Mode    : {args.fail}")
    print("=" * 60)

    engine = DynamicAgentEngine(failure_type=args.fail)
    trace = engine.run(user_query)

    print("\n--- LIVE EXECUTION TRACE STEPS ---")
    for step in trace["steps"]:
        status_tag = "[SUCCESS]" if step["status"] == "success" else "[FAILED]"
        print(f"Step {step['step_id']} [{step['name']}] ({step['type']}): {status_tag}")
        print(f"  Input : {step['input']}")
        print(f"  Output: {step['output']}\n")

    print(f"Overall Run Status: {trace['status'].upper()}")

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(trace, f, indent=2)
    print(f"Full structured execution trace saved to: {args.output}\n")


if __name__ == "__main__":
    main()