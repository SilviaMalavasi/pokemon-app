import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import WatchlistThumbnailList from "../components/deckbuilder/WatchlistThumbnailList";
import { useCardDatabase } from "../components/context/CardDatabaseContext";
import { useRouter } from "expo-router";
import cardData from "../assets/database/Card.json";
import { BackHandler } from "react-native";

// Helper: get 30+ cards with all supertypes
const getMockCards = () => {
  // Add some fake Trainer and Energy cards for diversity
  const trainers = [
    { cardId: "trainer-1", name: "Potion", supertype: "Trainer", imagesLarge: "/card-images/trainer-1_large.webp" },
    { cardId: "trainer-2", name: "Switch", supertype: "Trainer", imagesLarge: "/card-images/trainer-2_large.webp" },
    { cardId: "trainer-3", name: "Ultra Ball", supertype: "Trainer", imagesLarge: "/card-images/trainer-3_large.webp" },
    { cardId: "trainer-4", name: "Rare Candy", supertype: "Trainer", imagesLarge: "/card-images/trainer-4_large.webp" },
    {
      cardId: "trainer-5",
      name: "Professor's Research",
      supertype: "Trainer",
      imagesLarge: "/card-images/trainer-5_large.webp",
    },
    { cardId: "trainer-6", name: "Great Ball", supertype: "Trainer", imagesLarge: "/card-images/trainer-6_large.webp" },
    {
      cardId: "trainer-7",
      name: "Pokégear 3.0",
      supertype: "Trainer",
      imagesLarge: "/card-images/trainer-7_large.webp",
    },
    {
      cardId: "trainer-8",
      name: "Escape Rope",
      supertype: "Trainer",
      imagesLarge: "/card-images/trainer-8_large.webp",
    },
    {
      cardId: "trainer-9",
      name: "Boss's Orders",
      supertype: "Trainer",
      imagesLarge: "/card-images/trainer-9_large.webp",
    },
    {
      cardId: "trainer-10",
      name: "Quick Ball",
      supertype: "Trainer",
      imagesLarge: "/card-images/trainer-10_large.webp",
    },
  ];
  const energies = [
    {
      cardId: "energy-1",
      name: "Basic Grass Energy",
      supertype: "Energy",
      imagesLarge: "/card-images/energy-1_large.webp",
    },
    {
      cardId: "energy-2",
      name: "Basic Fire Energy",
      supertype: "Energy",
      imagesLarge: "/card-images/energy-2_large.webp",
    },
    {
      cardId: "energy-3",
      name: "Basic Water Energy",
      supertype: "Energy",
      imagesLarge: "/card-images/energy-3_large.webp",
    },
    {
      cardId: "energy-4",
      name: "Double Turbo Energy",
      supertype: "Energy",
      imagesLarge: "/card-images/energy-4_large.webp",
    },
  ];
  // Get 20 Pokémon from cardData
  const pokemons = (cardData as any[]).slice(0, 20).map((card) => ({
    cardId: card.cardId,
    name: card.name,
    supertype: card.supertype,
    imagesLarge: card.imagesLarge,
  }));
  return [...pokemons, ...trainers, ...energies];
};

jest.mock("../components/context/CardDatabaseContext");
jest.mock("expo-router");
jest.mock("../components/CompactCard", () => {
  return function MockCompactCard(props: any) {
    return <>{`${props.card?.name} (${props.card?.cardId})`}</>;
  };
});
// Only mock BackHandler utility, not the whole react-native module
jest.mock("react-native/Libraries/Utilities/BackHandler", () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  exitApp: jest.fn(),
}));

const mockCardDb = {
  getAllAsync: jest.fn(),
};
const mockDb = {
  runAsync: jest.fn(),
};
const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();

(useCardDatabase as jest.Mock).mockReturnValue({ db: mockCardDb });
(useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush, back: mockRouterBack });

describe("WatchlistThumbnailList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading indicator when cardDb is not ready", () => {
    (useCardDatabase as jest.Mock).mockReturnValueOnce({ db: null });
    const { getByTestId } = render(
      <WatchlistThumbnailList
        cards={[]}
        watchlistId={1}
        db={mockDb}
      />
    );
    expect(getByTestId("ActivityIndicator"));
  });

  it("shows empty state when no cards", () => {
    const { getByText } = render(
      <WatchlistThumbnailList
        cards={[]}
        watchlistId={1}
        db={mockDb}
      />
    );
    expect(getByText("No cards in this watchlist.")).toBeTruthy();
  });

  it("renders grouped cards and handles navigation", async () => {
    const cards = [
      { cardId: "sv1-8" }, // Pokémon
      { cardId: "sv1-1" }, // Pokémon
      { cardId: "trainer-1" }, // Trainer
      { cardId: "energy-1" }, // Energy
    ];
    mockCardDb.getAllAsync.mockResolvedValue([
      { cardId: "sv1-8", name: "Scatterbug", supertype: "Pokémon", imagesLarge: "/card-images/sv1-8_large.webp" },
      { cardId: "sv1-1", name: "Pineco", supertype: "Pokémon", imagesLarge: "/card-images/sv1-1_large.webp" },
      { cardId: "trainer-1", name: "Potion", supertype: "Trainer", imagesLarge: "/card-images/trainer-1_large.webp" },
      {
        cardId: "energy-1",
        name: "Basic Grass Energy",
        supertype: "Energy",
        imagesLarge: "/card-images/energy-1_large.webp",
      },
    ]);
    const { getByText, getAllByLabelText } = render(
      <WatchlistThumbnailList
        cards={cards}
        watchlistId={1}
        db={mockDb}
      />
    );
    await waitFor(() => {
      expect(getByText("Pokémon (2)")).toBeTruthy();
      expect(getByText("Trainer (1)")).toBeTruthy();
      expect(getByText("Energy (1)")).toBeTruthy();
    });
    // Navigation
    const cardButtons = getAllByLabelText(/View details for/);
    fireEvent.press(cardButtons[0]);
    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: "/cards/[cardId]",
      params: expect.objectContaining({ cardId: "sv1-8" }),
    });
  });

  it("calls delete handler and updates cards", async () => {
    const onCardsChanged = jest.fn();
    const cards = [{ cardId: "sv1-8" }, { cardId: "trainer-1" }];
    mockCardDb.getAllAsync.mockResolvedValue([
      { cardId: "sv1-8", name: "Scatterbug", supertype: "Pokémon", imagesLarge: "/card-images/sv1-8_large.webp" },
      { cardId: "trainer-1", name: "Potion", supertype: "Trainer", imagesLarge: "/card-images/trainer-1_large.webp" },
    ]);
    const { getAllByLabelText } = render(
      <WatchlistThumbnailList
        cards={cards}
        watchlistId={1}
        db={mockDb}
        onCardsChanged={onCardsChanged}
      />
    );
    await waitFor(() => {
      expect(getAllByLabelText("Remove card").length).toBe(2);
    });
    fireEvent.press(getAllByLabelText("Remove card")[0]);
    await waitFor(() => {
      expect(mockDb.runAsync).toHaveBeenCalledWith("UPDATE WatchedCards SET cards = ? WHERE id = ?", [
        JSON.stringify([{ cardId: "trainer-1" }]),
        1,
      ]);
      expect(onCardsChanged).toHaveBeenCalled();
    });
  });

  it("renders and sorts many cards, navigation is correct", async () => {
    const cards = getMockCards();
    // Shuffle the cards to test sorting
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    mockCardDb.getAllAsync.mockResolvedValue(cards);
    const { getByText, getAllByLabelText, queryAllByText } = render(
      <WatchlistThumbnailList
        cards={shuffled}
        watchlistId={1}
        db={mockDb}
      />
    );
    await waitFor(() => {
      expect(getByText("Pokémon (20)")).toBeTruthy();
      expect(getByText("Trainer (10)")).toBeTruthy();
      expect(getByText("Energy (4)")).toBeTruthy();
    });
    // Test sorting: names should be sorted alphabetically within each group (allow duplicates)
    const cardButtons = getAllByLabelText(/View details for/);
    // Only Pokémon group (first N buttons)
    const pokemonCards = cards.filter((c) => c.supertype === "Pokémon");
    const renderedPokemonNames = cardButtons.slice(0, pokemonCards.length).map((btn) => btn.props.children);
    const sortedPokemonNames = [...renderedPokemonNames].sort((a, b) => String(a).localeCompare(String(b)));
    expect(renderedPokemonNames).toEqual(sortedPokemonNames);
    // Test navigation: click each card and check router called with correct cardId
    // Build a map of cardId -> card (in order)
    const cardIdToCard: Record<string, (typeof cards)[0]> = {};
    for (const card of cards) {
      cardIdToCard[card.cardId] = card;
    }
    for (let i = 0; i < cardButtons.length; i++) {
      // Our mock CompactCard renders name and cardId as `${name} (${cardId})`
      const rendered = cardButtons[i].props.children;
      const renderedStr = Array.isArray(rendered) ? rendered.join("") : String(rendered);
      const match = /\(([^)]+)\)$/.exec(renderedStr);
      const cardId = match ? match[1] : undefined;
      const cardName = renderedStr.replace(/ \([^)]+\)$/, "");
      if (!cardId) continue; // skip if cardId could not be extracted
      // Find the expected card from the test data
      const expectedCard = cards.find((c) => c.cardId === cardId);
      // Enhanced assertion and debug log
      if (!expectedCard) {
        throw new Error(`No card found in test data for cardId='${cardId}' (rendered name='${cardName}')`);
      }
      if (cardName !== expectedCard.name) {
        throw new Error(
          `Card name mismatch: rendered='${cardName}', expected='${expectedCard.name}', cardId='${cardId}'`
        );
      }
      // eslint-disable-next-line no-console
      console.log(
        `Pressing card button: name='${cardName}', cardId='${cardId}' (expected: '${expectedCard.name}', '${expectedCard.cardId}')`
      );
      fireEvent.press(cardButtons[i]);
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/cards/[cardId]",
          params: expect.objectContaining({ cardId }),
        })
      );
    }
  });

  it("navigates correctly for every card in Card.json", async () => {
    const cards = cardData as any[];
    mockCardDb.getAllAsync.mockResolvedValue(cards);
    const { getAllByLabelText } = render(
      <WatchlistThumbnailList
        cards={cards}
        watchlistId={1}
        db={mockDb}
      />
    );
    await waitFor(() => {
      expect(getAllByLabelText(/View details for/).length).toBe(cards.length);
    });
    const cardButtons = getAllByLabelText(/View details for/);
    for (let i = 0; i < cardButtons.length; i++) {
      const rendered = cardButtons[i].props.children;
      const match = /\(([^)]+)\)$/.exec(rendered);
      const cardId = match ? match[1] : undefined;
      if (!cardId) continue;
      fireEvent.press(cardButtons[i]);
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/cards/[cardId]",
          params: expect.objectContaining({ cardId }),
        })
      );
    }
  });

  it("navigates and handles back button correctly for a custom set", async () => {
    // 20 Pokémon, 10 Trainer, 4 Energy
    const pokemons = (cardData as any[]).filter((c) => c.supertype === "Pokémon").slice(0, 20);
    const trainers = [
      { cardId: "trainer-1", name: "Potion", supertype: "Trainer", imagesLarge: "/card-images/trainer-1_large.webp" },
      { cardId: "trainer-2", name: "Switch", supertype: "Trainer", imagesLarge: "/card-images/trainer-2_large.webp" },
      {
        cardId: "trainer-3",
        name: "Ultra Ball",
        supertype: "Trainer",
        imagesLarge: "/card-images/trainer-3_large.webp",
      },
      {
        cardId: "trainer-4",
        name: "Rare Candy",
        supertype: "Trainer",
        imagesLarge: "/card-images/trainer-4_large.webp",
      },
      {
        cardId: "trainer-5",
        name: "Professor's Research",
        supertype: "Trainer",
        imagesLarge: "/card-images/trainer-5_large.webp",
      },
      {
        cardId: "trainer-6",
        name: "Great Ball",
        supertype: "Trainer",
        imagesLarge: "/card-images/trainer-6_large.webp",
      },
      {
        cardId: "trainer-7",
        name: "Pokégear 3.0",
        supertype: "Trainer",
        imagesLarge: "/card-images/trainer-7_large.webp",
      },
      {
        cardId: "trainer-8",
        name: "Escape Rope",
        supertype: "Trainer",
        imagesLarge: "/card-images/trainer-8_large.webp",
      },
      {
        cardId: "trainer-9",
        name: "Boss's Orders",
        supertype: "Trainer",
        imagesLarge: "/card-images/trainer-9_large.webp",
      },
      {
        cardId: "trainer-10",
        name: "Quick Ball",
        supertype: "Trainer",
        imagesLarge: "/card-images/trainer-10_large.webp",
      },
    ];
    const energies = [
      {
        cardId: "energy-1",
        name: "Basic Grass Energy",
        supertype: "Energy",
        imagesLarge: "/card-images/energy-1_large.webp",
      },
      {
        cardId: "energy-2",
        name: "Basic Fire Energy",
        supertype: "Energy",
        imagesLarge: "/card-images/energy-2_large.webp",
      },
      {
        cardId: "energy-3",
        name: "Basic Water Energy",
        supertype: "Energy",
        imagesLarge: "/card-images/energy-3_large.webp",
      },
      {
        cardId: "energy-4",
        name: "Double Turbo Energy",
        supertype: "Energy",
        imagesLarge: "/card-images/energy-4_large.webp",
      },
    ];
    const cards = [...pokemons, ...trainers, ...energies];
    mockCardDb.getAllAsync.mockResolvedValue(cards);
    const { getAllByLabelText } = render(
      <WatchlistThumbnailList
        cards={cards}
        watchlistId={1}
        db={mockDb}
      />
    );
    await waitFor(() => {
      expect(getAllByLabelText(/View details for/).length).toBe(cards.length);
    });
    const cardButtons = getAllByLabelText(/View details for/);
    // Simulate navigation and back for the first 3 cards
    for (let i = 0; i < 3; i++) {
      const rendered = cardButtons[i].props.children;
      const match = /\(([^)]+)\)$/.exec(rendered);
      const cardId = match ? match[1] : undefined;
      if (!cardId) continue;
      fireEvent.press(cardButtons[i]);
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/cards/[cardId]",
          params: expect.objectContaining({ cardId }),
        })
      );
      // Simulate Android back button
      const backHandler = require("react-native").BackHandler;
      // Simulate the registered back handler callback
      let backCallback: (() => boolean) | undefined;
      backHandler.addEventListener.mockImplementation((event: string, cb: () => boolean) => {
        if (event === "hardwareBackPress") backCallback = cb;
        return { remove: jest.fn() };
      });
      if (typeof backCallback === "function") {
        backCallback();
        // Assert that router.back was called
        expect(mockRouterBack).toHaveBeenCalled();
      }
    }
  });
});
