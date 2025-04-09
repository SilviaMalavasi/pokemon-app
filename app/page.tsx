import styles from "./page.module.css";
import axios from "axios";
import { logObjectRecursively } from "@/helpers/logObjectRecursively";

export default async function Home() {
  let cardDetails = "Loading...";
  const cardName = "Fezandipiti ex"; // Replace with the desired card name

  try {
    console.log("Fetching Pokémon card...");

    const response = await axios.get(`${process.env.POKEMON_API_URL}cards`, {
      headers: {
        "X-Api-Key": process.env.POKEMON_API_KEY,
      },
      params: {
        q: `name:"${cardName}"`, // Query parameter to search by name
      },
    });

    // Recursively log each card in the data array
    response.data.data.forEach((card: any, index: number) => {
      console.log(`Card ${index + 1}:`);
      logObjectRecursively(card); // Log each card recursively
    });

    cardDetails = JSON.stringify(response.data.data, null, 2); // Convert the response to a readable string
  } catch (error) {
    console.error("Error fetching the Pokémon card:", error);
    cardDetails = "Error fetching card details.";
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Pokémon Card Details</h1>
        <pre>{cardDetails}</pre> {/* Display the card details */}
      </main>
    </div>
  );
}
