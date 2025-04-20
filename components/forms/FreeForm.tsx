import React, { useState } from "react";
import ThemedView from "@/components/base/ThemedView";
import ThemedButton from "@/components/base/ThemedButton";
import TextInput from "@/components/base/TextInput";

export default function FreeForm(): JSX.Element {
  const [cardSearch, setCardSearch] = useState("");

  const handleSubmit = () => {
    // Collect all filter values
    const filters = {
      cardSearch,
    };
    console.log(filters);
  };

  return (
    <ThemedView>
      <TextInput
        label="Free Search"
        value={cardSearch}
        onChange={setCardSearch}
        placeholder="Frer text"
      />
      <ThemedButton
        title="Search"
        onPress={handleSubmit}
      />
    </ThemedView>
  );
}
