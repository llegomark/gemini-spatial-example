export const predictImage = async (
  mimeType: string,
  imageData: string,
  prompt: string,
  activeModel: "flash" | "pro",
) => {
  const url =
    activeModel === "flash"
      ? "/api/flashGenerateResponseToTextAndImage"
      : "/api/proGenerateResponseToTextAndImage";
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        prompt: prompt,
        imageData: imageData,
        mimeType: mimeType,
      }),
    });
    const result = await response.json();
    if (response.ok) {
      return result;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error generating response:", error);
    if (error instanceof Error) {
      return {
        error: {
          message: error.message,
        },
      };
    }
    return {
      error: {
        message: "An unknown error occurred",
      },
    };
  }
};