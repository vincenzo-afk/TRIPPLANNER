export async function getDestinationImage(query) {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn("Unsplash Access Key is missing. Returning placeholder.");
    return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"; // generic travel fallback
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
    
    return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"; // fallback
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error);
    return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"; // fallback
  }
}
