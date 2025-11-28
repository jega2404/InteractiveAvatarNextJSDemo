export const askFaq = async (question: string) => {
  const response = await fetch("/api/utils", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  const data = await response.json();
  return data.answer;
};
