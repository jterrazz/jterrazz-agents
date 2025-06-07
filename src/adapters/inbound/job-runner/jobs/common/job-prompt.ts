export const commonJobPrompt = `
This is a prompt triggered by a job runner to "wake up" the agent.
I will make this prompt multiple times in a day, but this doesn't mean you must respond every time.

- IMPORTANT: Find the right amount of notifications to make for the information you want to pass: probably around 1 message every 1 to 3 days
- This is based on the quality of the information you want to pass, and your ChatBot's chat history
- If you choose not to post something when i'm making this prompt, it is an expected behavior
- If there is nothing new or relevant to add, do not respond anything
- Only include the most essential and impactful information, skip anything that is not much relevant
- Start by fetching the ChatBot's messages and stop if you already posted something recently`;
