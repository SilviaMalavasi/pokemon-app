import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import WatchlistThumbnailList from "../components/deckbuilder/WatchlistThumbnailList";

// Mock dependencies
const mockRouterPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

const mockCardDbGetAllAsync = jest.fn();
// Create a stable db object for the mock
const stableMockDb = { getAllAsync: mockCardDbGetAllAsync };
jest.mock("@/components/context/CardDatabaseContext", () => ({
  useCardDatabase: () => ({ db: stableMockDb }), // Use the stable object
}));

jest.mock("@/components/CompactCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const RNView = require("react-native").View;
  const RNText = require("react-native").Text;
  return ({ card, disableLink }) => (
    <RNView
      testID={`compact-card-${card.cardId}`}
      data-disableLink={disableLink}
    >
      <RNText>{card.name}</RNText>
    </RNView>
  );
});

jest.mock("@/components/base/ThemedText", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const RNText = require("react-native").Text;
  return ({ children, style, type }) => (
    <RNText
      style={style}
      data-type={type}
    >
      {children}
    </RNText>
  );
});

jest.mock("@/style/ui/Theme", () => ({
  theme: {
    colors: { purple: "purple" },
    padding: { small: 2, medium: 4, large: 8 },
  },
}));

jest.mock("@/style/deckbuilder/WatchlistThumbnailListStyle", () => ({ default: {} }));

const mockDbRunAsync = jest.fn();
const mockOnCardsChanged = jest.fn();

const mockWatchlistId = 1;
const mockDbProp = { runAsync: mockDbRunAsync };

const sampleCards = [
  { cardId: "sv1-8", name: "Scatterbug" },
  { cardId: "sv1-1", name: "Pineco" },
  { cardId: "sv1-6", name: "Cacturne" },
  { cardId: "sv1-12", name: "Gogoat" },
  { cardId: "sv1-13", name: "Sprigatito" },
];

const sampleCardDataMapResults = [
  { cardId: "sv1-8", name: "Scatterbug", supertype: "Pokémon", imagesLarge: "/card-images/sv1-8_large.webp" },
  { cardId: "sv1-1", name: "Pineco", supertype: "Pokémon", imagesLarge: "/card-images/sv1-1_large.webp" },
  { cardId: "sv1-6", name: "Cacturne", supertype: "Pokémon", imagesLarge: "/card-images/sv1-6_large.webp" },
  { cardId: "sv1-12", name: "Gogoat", supertype: "Pokémon", imagesLarge: "/card-images/sv1-12_large.webp" },
  { cardId: "sv1-13", name: "Sprigatito", supertype: "Pokémon", imagesLarge: "/card-images/sv1-13_large.webp" },
];

describe("WatchlistThumbnailList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCardDbGetAllAsync.mockImplementation(() => Promise.resolve(sampleCardDataMapResults));
    mockDbRunAsync.mockResolvedValue(undefined);
  });

  it("renders an empty message when no cards are provided", async () => {
    const { findByText } = render(
      <WatchlistThumbnailList
        cards={[]}
        watchlistId={mockWatchlistId}
        db={mockDbProp}
        onCardsChanged={mockOnCardsChanged}
      />
    );
    // No act needed here as it's not waiting for async data load based on props
    expect(await findByText("No cards in this watchlist.")).toBeTruthy();
  });

  it("renders cards grouped by supertype", async () => {
    const { findAllByTestId, findByText } = render(
      <WatchlistThumbnailList
        cards={sampleCards}
        watchlistId={mockWatchlistId}
        db={mockDbProp}
        onCardsChanged={mockOnCardsChanged}
      />
    );

    // Wait for a group header that appears after cardDataMap is populated.
    expect(await findByText("Pokémon (5)")).toBeTruthy();

    // Now that data is loaded, we can verify other aspects.
    expect(mockCardDbGetAllAsync).toHaveBeenCalled();
    expect(await findByText("Trainer (0)")).toBeTruthy();
    expect(await findByText("Energy (0)")).toBeTruthy();

    // Check if cards are rendered (via CompactCard mock)
    expect(await findAllByTestId(/^compact-card-/)).toHaveLength(sampleCards.length);
    expect(await findByText("Scatterbug")).toBeTruthy();
    expect(await findByText("Pineco")).toBeTruthy();
    expect(await findByText("Cacturne")).toBeTruthy();
    expect(await findByText("Gogoat")).toBeTruthy();
    expect(await findByText("Sprigatito")).toBeTruthy();
  });

  it("navigates to card details on press", async () => {
    const { findByTestId } = render(
      <WatchlistThumbnailList
        cards={sampleCards}
        watchlistId={mockWatchlistId}
        db={mockDbProp}
        onCardsChanged={mockOnCardsChanged}
      />
    );

    const firstCardId = sampleCards[0].cardId; // Scatterbug
    const firstCardComponent = await findByTestId(`compact-card-${firstCardId}`);

    // Verify the mock call after the component is found.
    expect(mockCardDbGetAllAsync).toHaveBeenCalled();

    // The TouchableOpacity is the parent of CompactCard in the component structure
    fireEvent.press(firstCardComponent.parent);

    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: "/cards/[cardId]",
      params: { cardId: firstCardId, watchlistId: mockWatchlistId, from: "watchlistDetail" },
    });

    const pinecoCardId = sampleCards.find((c) => c.name === "Pineco")?.cardId;
    const pinecoCardComponent = await findByTestId(`compact-card-${pinecoCardId}`);
    fireEvent.press(pinecoCardComponent.parent);
    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: "/cards/[cardId]",
      params: { cardId: pinecoCardId, watchlistId: mockWatchlistId, from: "watchlistDetail" },
    });
  });

  it("handles card deletion", async () => {
    const { findAllByLabelText, findByText } = render(
      <WatchlistThumbnailList
        cards={sampleCards}
        watchlistId={mockWatchlistId}
        db={mockDbProp}
        onCardsChanged={mockOnCardsChanged}
      />
    );

    // Wait for initial data load and cards to be rendered
    expect(await findByText("Scatterbug")).toBeTruthy();
    // Ensure the getAllAsync was called for the initial load.
    expect(mockCardDbGetAllAsync).toHaveBeenCalledTimes(1);

    // Find all delete buttons
    const deleteButtons = await findAllByLabelText("Remove card");
    expect(deleteButtons.length).toBe(sampleCards.length);

    // Simulate deleting the first card (Scatterbug)
    fireEvent.press(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDbRunAsync).toHaveBeenCalledWith("UPDATE WatchedCards SET cards = ? WHERE id = ?", [
        JSON.stringify(sampleCards.slice(1)),
        mockWatchlistId,
      ]);
    });
    expect(mockOnCardsChanged).toHaveBeenCalledTimes(1);

    // Note: This test only checks if the DB call and callback are made.
    // To check UI update, the parent component would need to pass updated `cards` prop.
    // For example, if onCardsChanged causes a re-render with fewer cards:
    // const { rerender } = render(...);
    // mockOnCardsChanged.mockImplementationOnce(() => {
    //   rerender(<WatchlistThumbnailList cards={sampleCards.slice(1)} ... />)
    // });
    // fireEvent.press(deleteButtons[0]);
    // await waitFor(() => expect(queryByText("Scatterbug")).toBeNull());
  });

  it("shows loading indicator if cardDb is not available initially", () => {
    // Override mock for this test
    jest
      .spyOn(require("@/components/context/CardDatabaseContext"), "useCardDatabase")
      .mockReturnValueOnce({ db: null });

    const { getByTestId, queryByText } = render(
      <WatchlistThumbnailList
        cards={sampleCards}
        watchlistId={mockWatchlistId}
        db={mockDbProp}
        onCardsChanged={mockOnCardsChanged}
      />
    );
    // Check for the loading indicator's wrapper view
    expect(getByTestId("loading-indicator-view")).toBeTruthy();
    // Cards should not be rendered yet
    expect(queryByText("Scatterbug")).toBeNull();
  });
});
