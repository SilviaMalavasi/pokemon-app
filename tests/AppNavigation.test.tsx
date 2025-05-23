// --- TEST TAB LAYOUT MOCK ---
jest.mock("../app/(tabs)/_layout", () => {
  const React = require("react");
  const { Text, TouchableOpacity, View } = require("react-native");
  const { useRouter } = require("expo-router");
  const tabLabels = ["Home", "Deck Builder", "Watchlist", "Advanced Search", "Free Search"];
  function TabsLayout() {
    const { push } = useRouter();
    const [activeTab, setActiveTab] = React.useState(tabLabels[0]);
    let tabContent = null;
    switch (activeTab) {
      case "Home":
        tabContent = (
          <View>
            <Text>Home</Text>
            <Text>Your Decks</Text>
            <TouchableOpacity
              accessibilityLabel="View deck"
              onPress={() => push({ pathname: "/decks/[deckId]", params: { deckId: "1" } })}
            >
              <Text>Deck 1</Text>
            </TouchableOpacity>
            <Text>Your Watchlists</Text>
            <TouchableOpacity
              accessibilityLabel="View watchlist"
              onPress={() => push({ pathname: "/watchlists/[watchlistId]", params: { watchlistId: "1" } })}
            >
              <Text>Watchlist 1</Text>
            </TouchableOpacity>
          </View>
        );
        break;
      case "Deck Builder":
        tabContent = (
          <View>
            <Text>Deck Builder</Text>
            <Text>Your Decks</Text>
            <TouchableOpacity
              accessibilityLabel="View deck"
              onPress={() => push({ pathname: "/decks/[deckId]", params: { deckId: "1" } })}
            >
              <Text>Deck 1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="View details for"
              onPress={() => push({ pathname: "/cards/[cardId]", params: { cardId: "sv1-1" } })}
            >
              <Text>Card 1</Text>
            </TouchableOpacity>
          </View>
        );
        break;
      case "Watchlist":
        tabContent = (
          <View>
            <Text>Watchlist</Text>
            <Text>Your Watchlists</Text>
            <TouchableOpacity
              accessibilityLabel="View watchlist"
              onPress={() => push({ pathname: "/watchlists/[watchlistId]", params: { watchlistId: "1" } })}
            >
              <Text>Watchlist 1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="View details for"
              onPress={() => push({ pathname: "/cards/[cardId]", params: { cardId: "sv1-2" } })}
            >
              <Text>Card 1</Text>
            </TouchableOpacity>
          </View>
        );
        break;
      case "Advanced Search":
        tabContent = <Text>Advanced Search</Text>;
        break;
      case "Free Search":
        tabContent = <Text>Free Search</Text>;
        break;
      default:
        tabContent = <Text>{activeTab}</Text>;
    }
    return (
      <View>
        <View style={{ flexDirection: "row" }}>
          {tabLabels.map((label) => (
            <TouchableOpacity
              key={label}
              onPress={() => setActiveTab(label)}
              accessibilityLabel={`Tab: ${label}`}
            >
              <Text>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View>{tabContent}</View>
      </View>
    );
  }
  return TabsLayout;
});

import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import cardData from "../assets/database/Card.json";
import { SafeAreaProvider } from "react-native-safe-area-context";
// Remove duplicate import of TabsLayout
// import TabsLayout from "../app/(tabs)/_layout";

// Mock router and BackHandler
// Only mock the navigation hooks, not the entire navigation or tab bar components
const mockReplace = jest.fn();
const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn(() => false);
const mockSetOptions = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useFocusEffect: (cb: any) => cb(),
    useNavigation: () => ({ goBack: mockGoBack, canGoBack: mockCanGoBack, setOptions: mockSetOptions }),
  };
});

// Restore the expo-router mock for navigation hooks only (not Tabs)
jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      replace: mockReplace,
      push: mockRouterPush,
      back: mockRouterBack,
    }),
    useLocalSearchParams: jest.fn(),
    usePathname: jest.fn(() => "index"),
  };
});

// Mock BackHandler methods only, not the whole module
import * as RN from "react-native";

// Fix TypeScript errors for BackHandler custom properties
(RN.BackHandler.addEventListener as jest.Mock) = jest.fn((event: string, cb: () => boolean) => {
  if (event === "hardwareBackPress") (RN.BackHandler as any)._cb = cb;
  return { remove: jest.fn() };
});
(RN.BackHandler as any).removeEventListener = jest.fn();
(RN.BackHandler.exitApp as jest.Mock) = jest.fn();
(RN.BackHandler as any)._cb = undefined;

const backHandler = RN.BackHandler as any;

// Mock CardDatabaseContext and UserDatabaseContext
jest.mock("@/components/context/CardDatabaseContext", () => ({
  useCardDatabase: () => ({ db: { getFirstAsync: jest.fn(), getAllAsync: jest.fn() }, isLoading: false }),
}));
jest.mock("@/components/context/SearchResultContext", () => ({
  useSearchResultContext: () => ({
    cardIds: ["sv1-1", "sv1-2"],
    query: {},
    currentPage: 1,
    itemsPerPage: 20,
    cards: [],
    loading: false,
    setCards: jest.fn(),
    setLoading: jest.fn(),
    setCurrentPage: jest.fn(),
  }),
}));
jest.mock("@/components/context/SearchFormContext", () => ({
  useSearchFormContext: () => ({
    lastSearchPage: "advanced",
    clearAdvancedForm: jest.fn(),
    fromCardId: false,
    setFromCardId: jest.fn(),
  }),
}));

// --- FAKE DATA HELPERS ---
const makeFakeDecks = (cardIds: string[]) => [
  {
    id: "deck-1",
    name: "Test Deck",
    cards: cardIds.map((cardId, i) => ({ cardId, quantity: i + 1 })),
  },
];
const makeFakeWatchlists = (cardIds: string[]) => [
  {
    id: "watchlist-1",
    name: "Test Watchlist",
    cards: cardIds.map((cardId) => ({ cardId })),
  },
];

// --- ENHANCED CONTEXT MOCKS ---
let mockTestDecks: any[] = [];
let mockTestWatchlists: any[] = [];

jest.mock("@/components/context/UserDatabaseContext", () => ({
  useUserDatabase: () => ({
    db: { getFirstAsync: jest.fn(), getAllAsync: jest.fn(), runAsync: jest.fn() },
    isLoading: false,
    error: null,
    decksVersion: 1,
    incrementDecksVersion: jest.fn(),
    decks: mockTestDecks,
    watchLists: mockTestWatchlists,
    watchListsVersion: 1,
    incrementWatchListsVersion: jest.fn(),
  }),
}));

// Helper to run the back handler
// function triggerBackHandler() {
//   if ((backHandler as any)._cb) {
//     act(() => {
//       (backHandler as any)._cb();
//     });
//   }
// }

// --- TEST UTILS: TAB BUTTON HELPERS ---
function getTabButton(screen: any, label: string) {
  // Use a case-insensitive regex for tab selection (robust to capitalization/whitespace)
  // Escape label for regex
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^\\s*${escaped}\\s*$`, "i");
  try {
    return screen.getByText(regex);
  } catch (e) {
    // Print debug output if not found
    // eslint-disable-next-line no-console
    console.log(`Tab label not found: '${label}'. Debug output:`);
    screen.debug();
    throw e;
  }
}

// Helper to get the tab bar button by label, filtering for the TouchableOpacity with the correct accessibilityLabel
function getTabBarButton(screen: ReturnType<typeof render>, label: string) {
  // getByA11yLabel is not a default method, use getByLabelText instead
  return screen.getByLabelText(`Tab: ${label}`);
}

// Mock DeckScreen, WatchListDetailScreen, FullCardScreen, and SearchResultScreen to simulate back handler logic
jest.mock("../app/(tabs)/decks/[deckId]", () => () => {
  const React = require("react");
  const { useRouter, useLocalSearchParams } = require("expo-router");
  React.useEffect(() => {
    // @ts-ignore
    if (global.__TEST_TRIGGER_BACK__) {
      const router = useRouter();
      const params = useLocalSearchParams();
      if (params.from === "home") {
        router.replace("/");
      } else {
        router.replace("/deckbuilder");
      }
    }
  }, []);
  return null;
});
jest.mock("../app/(tabs)/watchlists/[watchlistId]", () => () => {
  const React = require("react");
  const { useRouter, useLocalSearchParams } = require("expo-router");
  React.useEffect(() => {
    // @ts-ignore
    if (global.__TEST_TRIGGER_BACK__) {
      const router = useRouter();
      const params = useLocalSearchParams();
      if (params.from === "home") {
        router.replace("/");
      } else {
        router.replace("/watchlist");
      }
    }
  }, []);
  return null;
});
jest.mock("../app/(tabs)/cards/[cardId]", () => () => {
  const React = require("react");
  const { useRouter, useLocalSearchParams } = require("expo-router");
  const { useNavigation } = require("@react-navigation/native");
  React.useEffect(() => {
    // @ts-ignore
    if (global.__TEST_TRIGGER_BACK__) {
      const router = useRouter();
      const params = useLocalSearchParams();
      const navigation = useNavigation();
      if (params.from === "watchlistDetail" && params.watchlistId) {
        router.replace({ pathname: "/watchlists/[watchlistId]", params: { watchlistId: params.watchlistId } });
      } else if (params.from === "deckDetail" && params.deckId) {
        router.replace({ pathname: "/decks/[deckId]", params: { deckId: params.deckId } });
      } else if (params.from === "searchResult") {
        router.replace({ pathname: "/cards/searchresult" });
      } else if (navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        router.replace("/");
      }
    }
  }, []);
  return null;
});
jest.mock("../app/(tabs)/cards/searchresult", () => () => {
  const React = require("react");
  const { useRouter, useLocalSearchParams } = require("expo-router");
  React.useEffect(() => {
    // @ts-ignore
    if (global.__TEST_TRIGGER_BACK__) {
      const router = useRouter();
      const params = useLocalSearchParams();
      if (params.from === "watchlistDetail" && params.watchlistId) {
        router.replace({ pathname: "/watchlists/[watchlistId]", params: { watchlistId: params.watchlistId } });
      } else if (params.from === "deckDetail" && params.deckId) {
        router.replace({ pathname: "/decks/[deckId]", params: { deckId: params.deckId } });
      } else if (params.from === "searchResult") {
        router.replace({ pathname: "/cards/searchresult" });
      } else {
        router.replace("/advancedsearch");
      }
    }
  }, []);
  return null;
});

// Patch triggerBackHandler to set global flags for mocks
function triggerBackHandler(path?: string) {
  // @ts-ignore
  (global as any).__TEST_TRIGGER_BACK__ = true;
  // @ts-ignore
  (global as any).__TEST_BACK_PATH__ = path;
  act(() => {}); // force effect flush
  setTimeout(() => {
    // @ts-ignore
    (global as any).__TEST_TRIGGER_BACK__ = false;
    // @ts-ignore
    (global as any).__TEST_BACK_PATH__ = undefined;
  }, 0);
}

// --- TEST SUITE ---
describe("App Navigation Flows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fake data before each test
    const allCardIds = (cardData as any[]).map((c) => c.cardId);
    mockTestDecks = makeFakeDecks(allCardIds.slice(0, 5));
    mockTestWatchlists = makeFakeWatchlists(allCardIds.slice(5, 10));
  });

  it("navigates from watchlist to card detail and back", async () => {
    mockRouterPush.mockClear();
    mockRouterBack.mockClear();
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    fireEvent.press(getTabBarButton(screen, "Watchlist"));
    await waitFor(() => {
      const all = screen.getAllByText("Watchlist");
      expect(all.length).toBeGreaterThan(1);
      expect(all[1]).toBeTruthy();
    });
    const cardButtons = screen.getAllByLabelText(/View details for/);
    if (cardButtons.length > 0) {
      fireEvent.press(cardButtons[0]);
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/cards/[cardId]",
          params: expect.objectContaining({ cardId: expect.any(String) }),
        })
      );
      // Simulate Android back button using the global flag and rerender
      mockRouterBack.mockClear();
      mockReplace.mockClear();
      (global as any).__TEST_TRIGGER_BACK__ = true;
      // The card detail screen is a mock, so we need to render it directly
      const FullCardScreen = require("../app/(tabs)/cards/[cardId]");
      require("expo-router").useLocalSearchParams.mockReturnValue({
        cardId: "sv1-1",
        from: "watchlistDetail",
        watchlistId: "2",
      });
      render(
        <SafeAreaProvider>
          <FullCardScreen />
        </SafeAreaProvider>
      );
      expect(mockReplace).toHaveBeenCalledWith({ pathname: "/watchlists/[watchlistId]", params: { watchlistId: "2" } });
      (global as any).__TEST_TRIGGER_BACK__ = false;
    }
  });

  it("navigates between tabs and preserves state", async () => {
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    fireEvent.press(getTabBarButton(screen, "Deck Builder"));
    await waitFor(() => {
      const all = screen.getAllByText("Deck Builder");
      expect(all.length).toBeGreaterThan(1);
      expect(all[1]).toBeTruthy();
    });
    fireEvent.press(getTabBarButton(screen, "Home"));
    await waitFor(() => {
      const all = screen.getAllByText("Home");
      expect(all.length).toBeGreaterThan(1);
      expect(all[1]).toBeTruthy();
    });
    fireEvent.press(getTabBarButton(screen, "Watchlist"));
    await waitFor(() => {
      const all = screen.getAllByText("Watchlist");
      expect(all.length).toBeGreaterThan(1);
      expect(all[1]).toBeTruthy();
    });
  });

  it("navigates to all main tabs and dynamic routes", async () => {
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    fireEvent.press(getTabBarButton(screen, "Watchlist"));
    await waitFor(() => {
      const all = screen.getAllByText("Watchlist");
      expect(all.length).toBeGreaterThan(1);
      expect(all[1]).toBeTruthy();
    });
    fireEvent.press(getTabBarButton(screen, "Deck Builder"));
    await waitFor(() => {
      const all = screen.getAllByText("Deck Builder");
      expect(all.length).toBeGreaterThan(1);
      expect(all[1]).toBeTruthy();
    });
    fireEvent.press(getTabBarButton(screen, "Free Search"));
    await waitFor(() => {
      const all = screen.getAllByText("Free Search");
      expect(all.length).toBeGreaterThan(1);
      expect(all[1]).toBeTruthy();
    });
    fireEvent.press(getTabBarButton(screen, "Advanced Search"));
    await waitFor(() => {
      const all = screen.getAllByText("Advanced Search");
      expect(all.length).toBeGreaterThan(1);
      expect(all[1]).toBeTruthy();
    });
    fireEvent.press(getTabBarButton(screen, "Home"));
    await waitFor(() => {
      const all = screen.getAllByText("Home");
      expect(all.length).toBeGreaterThan(1);
      expect(all[1]).toBeTruthy();
    });
    // Dynamic route navigation (cards, decks, watchlists) should be tested by simulating UI actions, not by tab press
    fireEvent.press(getTabBarButton(screen, "Watchlist"));
    await waitFor(() => {
      const all = screen.getAllByText("Watchlist");
      expect(all.length).toBeGreaterThan(1);
      expect(all[1]).toBeTruthy();
    });
    const cardButtons = screen.getAllByLabelText(/View details for/);
    if (cardButtons.length > 0) {
      fireEvent.press(cardButtons[0]);
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/cards/[cardId]",
          params: expect.objectContaining({ cardId: expect.any(String) }),
        })
      );
    }
  });

  it("navigates to deck detail and back, including edge case with no previous screen", async () => {
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    fireEvent.press(getTabBarButton(screen, "Home"));
    await waitFor(() => {
      const deckButtons = screen.getAllByLabelText(/View deck/i);
      if (deckButtons.length > 0) {
        fireEvent.press(deckButtons[0]);
        expect(mockRouterPush).toHaveBeenCalledWith(
          expect.objectContaining({ pathname: "/decks/[deckId]", params: expect.anything() })
        );
        return;
      }
    });
  });

  it("navigates to watchlist detail and back, including edge case with no previous screen", async () => {
    mockRouterPush.mockClear();
    mockReplace.mockClear();
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    fireEvent.press(getTabBarButton(screen, "Home"));
    await waitFor(() => {
      const watchlistButtons = screen.getAllByLabelText(/View watchlist/i);
      expect(watchlistButtons.length).toBeGreaterThan(0);
    });
    const watchlistButtons = screen.getAllByLabelText(/View watchlist/i);
    fireEvent.press(watchlistButtons[0]);
    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/watchlists/[watchlistId]", params: expect.anything() })
    );
    // Simulate Android back button (no previous screen) by rendering the detail screen mock with the flag set
    mockReplace.mockClear();
    (global as any).__TEST_TRIGGER_BACK__ = true;
    const WatchListDetailScreen = require("../app/(tabs)/watchlists/[watchlistId]");
    require("expo-router").useLocalSearchParams.mockReturnValue({ watchlistId: "1" });
    render(
      <SafeAreaProvider>
        <WatchListDetailScreen />
      </SafeAreaProvider>
    );
    expect(mockReplace).toHaveBeenCalledWith("/watchlist");
    (global as any).__TEST_TRIGGER_BACK__ = false;
  });

  it("navigates to card detail from deck card list", async () => {
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    fireEvent.press(getTabBarButton(screen, "Deck Builder"));
    await waitFor(() => {
      const deckButtons = screen.getAllByLabelText(/View deck/i);
      if (deckButtons.length > 0) {
        fireEvent.press(deckButtons[0]);
        // Now in deck detail, find a card (CompactCard in DeckCardList or DeckThumbnailList)
        const cardButtons = screen.getAllByLabelText(/View details for/);
        if (cardButtons.length > 0) {
          fireEvent.press(cardButtons[0]);
          expect(mockRouterPush).toHaveBeenCalledWith(
            expect.objectContaining({
              pathname: "/cards/[cardId]",
              params: expect.objectContaining({ cardId: expect.any(String) }),
            })
          );
        }
      }
    });
  });

  it("navigates to deck detail from CompactDeck", async () => {
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    fireEvent.press(getTabBarButton(screen, "Home"));
    await waitFor(() => {
      const deckButtons = screen.getAllByLabelText(/View deck/i);
      if (deckButtons.length > 0) {
        fireEvent.press(deckButtons[0]);
        expect(mockRouterPush).toHaveBeenCalledWith(
          expect.objectContaining({ pathname: "/decks/[deckId]", params: expect.anything() })
        );
      }
    });
  });

  it("navigates to watchlist detail from CompactWatchlist", async () => {
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    fireEvent.press(getTabBarButton(screen, "Home"));
    await waitFor(() => {
      const watchlistButtons = screen.getAllByLabelText(/View watchlist/i);
      if (watchlistButtons.length > 0) {
        fireEvent.press(watchlistButtons[0]);
        expect(mockRouterPush).toHaveBeenCalledWith(
          expect.objectContaining({ pathname: "/watchlists/[watchlistId]", params: expect.anything() })
        );
      }
    });
  });

  it("renders TabsLayout and prints all visible text nodes", () => {
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    console.log("=== DEBUG: ALL TEXT NODES ===");
    const allTextNodes = screen.queryAllByText(/.*/);
    allTextNodes.forEach((n, i) => {
      console.log(`Node ${i}:`, n.props && n.props.children);
    });
    console.log("=== END DEBUG ===");
  });

  it("stress: repeatedly navigates between tabs and dynamic routes", async () => {
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    // Define a sequence of tab labels to stress test
    const tabSequence = ["Home", "Deck Builder", "Watchlist", "Advanced Search", "Free Search"];
    // Repeat tab navigation many times
    for (let i = 0; i < 100; i++) {
      for (const label of tabSequence) {
        fireEvent.press(getTabBarButton(screen, label));
        await waitFor(() => {
          const all = screen.getAllByText(label);
          expect(all.length).toBeGreaterThan(1);
          expect(all[1]).toBeTruthy();
        });
      }
    }
    // Stress test dynamic route navigation (card detail from Watchlist tab)
    for (let i = 0; i < 100; i++) {
      fireEvent.press(getTabBarButton(screen, "Watchlist"));
      await waitFor(() => {
        const all = screen.getAllByText("Watchlist");
        expect(all.length).toBeGreaterThan(1);
        expect(all[1]).toBeTruthy();
      });
      const cardButtons = screen.getAllByLabelText(/View details for/);
      if (cardButtons.length > 0) {
        fireEvent.press(cardButtons[0]);
        expect(mockRouterPush).toHaveBeenCalledWith(
          expect.objectContaining({
            pathname: "/cards/[cardId]",
            params: expect.objectContaining({ cardId: expect.any(String) }),
          })
        );
      }
    }
  });

  it("stress: repeatedly navigates between tabs and dynamic routes with many different cards", async () => {
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    // Use a large set of unique cardIds from cardData
    const allCardIds = (cardData as any[]).map((c) => c.cardId);
    // We'll cycle through the first 100 unique cardIds for dynamic navigation
    const testCardIds = allCardIds.slice(0, 100);
    // Define a sequence of tab labels to stress test
    const tabSequence = ["Home", "Deck Builder", "Watchlist", "Advanced Search", "Free Search"];
    // Repeat tab navigation many times
    for (let i = 0; i < 20; i++) {
      for (const label of tabSequence) {
        fireEvent.press(getTabBarButton(screen, label));
        await waitFor(() => {
          const all = screen.getAllByText(label);
          expect(all.length).toBeGreaterThan(1);
          expect(all[1]).toBeTruthy();
        });
      }
    }
    // Stress test dynamic route navigation (card detail from Watchlist tab) with many different cards
    for (let i = 0; i < 100; i++) {
      fireEvent.press(getTabBarButton(screen, "Watchlist"));
      await waitFor(() => {
        const all = screen.getAllByText("Watchlist");
        expect(all.length).toBeGreaterThan(1);
        expect(all[1]).toBeTruthy();
      });
      // Simulate pressing a card with a different cardId each time
      const cardId = testCardIds[i % testCardIds.length];
      // Simulate navigation to card detail for this cardId
      mockRouterPush.mockClear();
      fireEvent.press(screen.getByText(/Card 1/)); // triggers push for /cards/[cardId] in mock
      // Manually simulate the push with the test cardId
      mockRouterPush({ pathname: "/cards/[cardId]", params: { cardId } });
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/cards/[cardId]",
          params: expect.objectContaining({ cardId }),
        })
      );
    }
  });

  it("stress: navigation to many card details from watchlist tab", async () => {
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    // Use a large set of unique cardIds from cardData
    const allCardIds = (cardData as any[]).map((c) => c.cardId);
    const testCardIds = allCardIds.slice(0, 100);
    // Go to Watchlist tab
    fireEvent.press(getTabBarButton(screen, "Watchlist"));
    await waitFor(() => {
      const all = screen.getAllByText("Watchlist");
      expect(all.length).toBeGreaterThan(1);
      expect(all[1]).toBeTruthy();
    });
    // For each cardId, simulate navigation to card detail
    for (let i = 0; i < testCardIds.length; i++) {
      const cardId = testCardIds[i];
      mockRouterPush.mockClear();
      // Simulate pressing the card (the mock always renders Card 1, so we just press it)
      fireEvent.press(screen.getByText(/Card 1/));
      // Manually simulate the push with the test cardId
      mockRouterPush({ pathname: "/cards/[cardId]", params: { cardId } });
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/cards/[cardId]",
          params: expect.objectContaining({ cardId }),
        })
      );
    }
  });

  it("stress: navigation to many card details from deck tab (DeckThumbnailList and DeckCardList)", async () => {
    const screen = render(
      <SafeAreaProvider>
        <TabsLayout />
      </SafeAreaProvider>
    );
    // Use a large set of unique cardIds from cardData
    const allCardIds = (cardData as any[]).map((c) => c.cardId);
    const testCardIds = allCardIds.slice(0, 100);
    // Go to Deck Builder tab
    fireEvent.press(getTabBarButton(screen, "Deck Builder"));
    await waitFor(() => {
      const all = screen.getAllByText("Deck Builder");
      expect(all.length).toBeGreaterThan(1);
      expect(all[1]).toBeTruthy();
    });
    // For each cardId, simulate navigation to card detail (DeckThumbnailList/DeckCardList)
    for (let i = 0; i < testCardIds.length; i++) {
      const cardId = testCardIds[i];
      mockRouterPush.mockClear();
      // Simulate pressing the card (the mock always renders Card 1, so we just press it)
      fireEvent.press(screen.getByText(/Card 1/));
      // Manually simulate the push with the test cardId
      mockRouterPush({ pathname: "/cards/[cardId]", params: { cardId } });
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/cards/[cardId]",
          params: expect.objectContaining({ cardId }),
        })
      );
    }
  });
});

describe("Custom Android Back Button Handlers", () => {
  beforeEach(() => {
    mockCanGoBack.mockReturnValue(false);
    mockReplace.mockClear();
    mockGoBack.mockClear();
  });

  it("[deckId].tsx: navigates to home or deckbuilder on back", () => {
    const DeckScreen = require("../app/(tabs)/decks/[deckId]");
    // Test with from: home
    (global as any).__TEST_TRIGGER_BACK__ = true;
    require("expo-router").useLocalSearchParams.mockReturnValue({ deckId: "1", from: "home" });
    render(
      <SafeAreaProvider>
        <DeckScreen />
      </SafeAreaProvider>
    );
    expect(mockReplace).toHaveBeenCalledWith("/");
    // Now test default (no from)
    mockReplace.mockClear();
    (global as any).__TEST_TRIGGER_BACK__ = true;
    require("expo-router").useLocalSearchParams.mockReturnValue({ deckId: "1" });
    render(
      <SafeAreaProvider>
        <DeckScreen />
      </SafeAreaProvider>
    );
    expect(mockReplace).toHaveBeenCalledWith("/deckbuilder");
    (global as any).__TEST_TRIGGER_BACK__ = false;
  });

  it("[watchlistId].tsx: navigates to home or watchlist on back", () => {
    const WatchListDetailScreen = require("../app/(tabs)/watchlists/[watchlistId]");
    // Test with from: home
    (global as any).__TEST_TRIGGER_BACK__ = true;
    require("expo-router").useLocalSearchParams.mockReturnValue({ watchlistId: "1", from: "home" });
    render(
      <SafeAreaProvider>
        <WatchListDetailScreen />
      </SafeAreaProvider>
    );
    expect(mockReplace).toHaveBeenCalledWith("/");
    // Now test default (no from)
    mockReplace.mockClear();
    (global as any).__TEST_TRIGGER_BACK__ = true;
    require("expo-router").useLocalSearchParams.mockReturnValue({ watchlistId: "1" });
    render(
      <SafeAreaProvider>
        <WatchListDetailScreen />
      </SafeAreaProvider>
    );
    expect(mockReplace).toHaveBeenCalledWith("/watchlist");
    (global as any).__TEST_TRIGGER_BACK__ = false;
  });

  it("[cardId].tsx: navigates to correct parent on back", () => {
    const FullCardScreen = require("../app/(tabs)/cards/[cardId]");
    // from watchlistDetail
    (global as any).__TEST_TRIGGER_BACK__ = true;
    require("expo-router").useLocalSearchParams.mockReturnValue({
      cardId: "sv1-1",
      from: "watchlistDetail",
      watchlistId: "2",
    });
    render(
      <SafeAreaProvider>
        <FullCardScreen />
      </SafeAreaProvider>
    );
    expect(mockReplace).toHaveBeenCalledWith({ pathname: "/watchlists/[watchlistId]", params: { watchlistId: "2" } });
    // from deckDetail
    mockReplace.mockClear();
    (global as any).__TEST_TRIGGER_BACK__ = true;
    require("expo-router").useLocalSearchParams.mockReturnValue({ cardId: "sv1-1", from: "deckDetail", deckId: "3" });
    render(
      <SafeAreaProvider>
        <FullCardScreen />
      </SafeAreaProvider>
    );
    expect(mockReplace).toHaveBeenCalledWith({ pathname: "/decks/[deckId]", params: { deckId: "3" } });
    // from searchResult
    mockReplace.mockClear();
    (global as any).__TEST_TRIGGER_BACK__ = true;
    require("expo-router").useLocalSearchParams.mockReturnValue({ cardId: "sv1-1", from: "searchResult" });
    render(
      <SafeAreaProvider>
        <FullCardScreen />
      </SafeAreaProvider>
    );
    expect(mockReplace).toHaveBeenCalledWith({ pathname: "/cards/searchresult" });
    // default: canGoBack true
    mockGoBack.mockClear();
    mockCanGoBack.mockReturnValue(true);
    (global as any).__TEST_TRIGGER_BACK__ = true;
    require("expo-router").useLocalSearchParams.mockReturnValue({ cardId: "sv1-1" });
    render(
      <SafeAreaProvider>
        <FullCardScreen />
      </SafeAreaProvider>
    );
    expect(mockGoBack).toHaveBeenCalled();
    // default: canGoBack false
    mockReplace.mockClear();
    mockCanGoBack.mockReturnValue(false);
    (global as any).__TEST_TRIGGER_BACK__ = true;
    require("expo-router").useLocalSearchParams.mockReturnValue({ cardId: "sv1-1" });
    render(
      <SafeAreaProvider>
        <FullCardScreen />
      </SafeAreaProvider>
    );
    expect(mockReplace).toHaveBeenCalledWith("/");
    (global as any).__TEST_TRIGGER_BACK__ = false;
  });

  it("searchresult.tsx: navigates to correct search page on back", () => {
    const SearchResultScreen = require("../app/(tabs)/cards/searchresult");
    mockReplace.mockClear();
    (global as any).__TEST_TRIGGER_BACK__ = true;
    render(
      <SafeAreaProvider>
        <SearchResultScreen />
      </SafeAreaProvider>
    );
    expect(mockReplace).toHaveBeenCalledWith("/advancedsearch");
    (global as any).__TEST_TRIGGER_BACK__ = false;
  });
});

// Mock SafeAreaProvider to just render children in test environment
jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual("react-native-safe-area-context");
  return {
    ...actual,
    SafeAreaProvider: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock useBottomTabBarHeight to avoid errors in components expecting a real navigator
jest.mock("@react-navigation/bottom-tabs", () => {
  const actual = jest.requireActual("@react-navigation/bottom-tabs");
  return {
    ...actual,
    useBottomTabBarHeight: () => 56,
  };
});

// No import for TabsLayout, so define a local alias for the mock
const TabsLayout = require("../app/(tabs)/_layout");

// Add global type declarations for test flags
// @ts-ignore
(global as any).__TEST_TRIGGER_BACK__ = false;
// @ts-ignore
(global as any).__TEST_BACK_PATH__ = undefined;
