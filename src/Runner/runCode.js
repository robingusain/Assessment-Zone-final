import axios from "axios";

const languageMap = {
  python: 71,
  javascript: 63,
  "text/x-c++src": 54,
  "text/x-java": 62,
};

export const runCode = async (code, language, input) => {
  const res = await axios.post(
    "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
    {
      source_code: code,
      stdin: input,
      language_id: languageMap[language],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    }
  );

  return (
    res.data.stdout ||
    res.data.stderr ||
    res.data.compile_output ||
    "No output"
  );
};
