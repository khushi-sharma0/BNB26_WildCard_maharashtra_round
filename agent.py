from google import genai

client = genai.Client(api_key="YOUR_API_KEY")


def ask_agent(question):
    # Step 1: Understand
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Understand this question and explain what needs to be done: {question}"
    )

    understanding = response.text
    print("\nSTEP 1 - UNDERSTANDING")
    print(understanding)

    # Step 2: Solve
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Solve this question: {question}"
    )

    solution = response.text
    print("\nSTEP 2 - SOLUTION")
    print(solution)

    # Step 3: Final answer
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Give a short final answer for: {question}"
    )

    answer = response.text
    print("\nSTEP 3 - FINAL ANSWER")
    print(answer)


question = input("Ask something: ")
ask_agent(question)