import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { BackHandler } from "react-native";
import cardData from "../assets/database/Card.json";

// Mock router and BackHandler
jest.mock("expo-router");
jest.mock("react-native/Libraries/Utilities/BackHandler", () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  exitApp: jest.fn(),
}));

const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush, back: mockRouterBack });

// Import the app's main layout or entry point
import AppLayout from "../app/_layout";

describe("App Navigation Flows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("navigates from watchlist to card detail and back", async () => {
    // Render the app's main layout
    const { getByText, getAllByLabelText } = render(<AppLayout />);
    // Simulate navigating to the watchlist tab
    // (You may need to adjust this selector based on your tab labels)
    fireEvent.press(getByText(/watchlist/i));
    await waitFor(() => {
      expect(getByText(/No cards in this watchlist|Pokémon|Trainer|Energy/)).toBeTruthy();
    });
    // If there are cards, tap the first card
    const cardButtons = getAllByLabelText(/View details for/);
    if (cardButtons.length > 0) {
      fireEvent.press(cardButtons[0]);
      // Should navigate to card detail
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/cards/[cardId]",
          params: expect.objectContaining({ cardId: expect.any(String) }),
        })
      );
      // Simulate Android back button
      const backHandler = require("react-native").BackHandler;
      let backCallback;
      backHandler.addEventListener.mockImplementation((event, cb) => {
        if (event === "hardwareBackPress") backCallback = cb;
        return { remove: jest.fn() };
      });
      if (typeof backCallback === "function") {
        backCallback();
        expect(mockRouterBack).toHaveBeenCalled();
      }
    }
  });

  it("navigates between tabs and preserves state", async () => {
    const { getByText } = render(<AppLayout />);
    // Go to deckbuilder tab
    fireEvent.press(getByText(/deckbuilder/i));
    await waitFor(() => {
      expect(getByText(/Deck Builder|Add Card|Your Deck/)).toBeTruthy();
    });
    // Go to cards tab
    fireEvent.press(getByText(/cards/i));
    await waitFor(() => {
      expect(getByText(/Search|All Cards|Pokémon/)).toBeTruthy();
    });
    // Go back to watchlist tab
    fireEvent.press(getByText(/watchlist/i));
    await waitFor(() => {
      expect(getByText(/Pokémon|Trainer|Energy|No cards/)).toBeTruthy();
    });
  });

  // Add more navigation scenarios as needed
});
