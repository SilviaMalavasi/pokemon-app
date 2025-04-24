import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { ThemedText, ThemedView } from '../components/themed';
import { useCardStore } from '../hooks/useCardStore';
import { useDeckStore } from '../hooks/useDeckStore';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'EditCard'>;
  route: RouteProp<RootStackParamList, 'EditCard'>;
};

export const EditCardScreen = ({ navigation, route }: Props) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { goBack } = navigation;
  const { cardId } = route.params;
  const { cards, updateCard } = useCardStore();
  const { decks, updateDeck } = useDeckStore();
  const [cardName, setCardName] = useState('');
  const [cardRules, setCardRules] = useState('');
  const [deckId, setDeckId] = useState('');

  const card = cards.find(card => card.id === cardId);

  useEffect(() => {
    if (card) {
      setCardName(card.name);
      setCardRules(card.rules);
      setDeckId(card.deckId);
    }
  }, [card]);

  const onSave = () => {
    updateCard({ id: cardId, name: cardName, rules: cardRules, deckId });
    const deck = decks.find(deck => deck.id === deckId);
    if (deck) {
      updateDeck({ ...deck, modified: new Date().toISOString() });
    }
    goBack();
  };

  if (!card) return null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedView style={{ marginBottom: 16 }}>
          <ThemedText style={{ marginBottom: 4 }}>
            Name
          </ThemedText>
          <TextInput
            style={[styles.input, { borderColor: colors.border }]}
            value={cardName}
            onChangeText={setCardName}
            placeholder={t('name')}
          />
        </ThemedView>
        <ThemedView style={{ marginBottom: 16 }}>
          <ThemedText style={{ marginBottom: 4 }}>
            Rules
          </ThemedText>
          <AutocompleteDropdown
            clearOnFocus={false}
            closeOnBlur={true}
            closeOnSubmit={true}
            initialValue={{ id: cardRules, title: cardRules }}
            dataSet={[
              { id: "prova", title: "prova" },
              { id: "prova2", title: "prova2" },
              { id: "prova3", title: "prova3" },
              { id: "prova4", title: "prova4" },
              { id: "prova5", title: "prova5" },
              { id: "prova6", title: "prova6" },
              { id: "prova7", title: "prova7" },
              { id: "prova8", title: "prova8" },
              { id: "prova9", title: "prova9" },
              { id: "prova10", title: "prova10" },
            ]}
            onSelectItem={item => setCardRules(item?.title || "")}
            textInputProps={{
              placeholder: "Card rules",
              value: cardRules,
              onChangeText: setCardRules,
              autoCorrect: false,
              autoCapitalize: "none"
            }}
            suggestionsListTextStyle={{ color: "#333" }}
          />
          <ThemedText type="hintText" style={{ marginTop: 4 }}>
            Rules refers to Pokémon special rules (es Pokémon-EX rules) or Trainer card rules.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
});