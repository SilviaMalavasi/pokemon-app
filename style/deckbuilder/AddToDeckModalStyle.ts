import { StyleSheet } from "react-native";
import { theme } from "@/style/ui/Theme";
import { vw } from "@/helpers/viewport";

const styles = StyleSheet.create({
  addButtonTrigger: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: vw(38),
    height: vw(12),
    right: theme.padding.xsmall * 0.5,
    bottom: 0,
    zIndex: 10,
    borderRadius: theme.borderRadius.xlarge,
    padding: 2,
    backgroundColor: theme.colors.mediumGrey,
    borderWidth: 1,
    marginBottom: theme.padding.xsmall * -1,
    borderColor: theme.colors.green,
    ...theme.shadow,
  },
  iconContainerStyle: {
    width: theme.padding.large * 0.75,
    height: theme.padding.large * 0.75,
    marginRight: theme.padding.small,
  },
  deckRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.padding.small,
  },
  deckName: {
    flex: 1,
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.padding.xsmall,
  },
  qtyText: {
    color: theme.colors.purple,
    width: vw(8),
  },
  qtyOperator: {
    fontSize: theme.fontSizes.font24,
    paddingHorizontal: 4,
    marginTop: theme.padding.xsmall * -0.5,
  },
  deckPickerContainer: {
    marginBottom: theme.padding.small,
    width: "100%",
    backgroundColor: "transparent",
  },
  deckPickerLabel: {
    marginTop: theme.padding.small * -1,
  },
  pickerWrapper: {
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.grey,
    backgroundColor: theme.colors.darkGrey,
    paddingHorizontal: theme.padding.small,
    paddingTop: theme.padding.small,
    paddingBottom: theme.padding.small * 0.9,
    marginBottom: theme.padding.xsmall,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
  },
  modalContainer: {
    marginHorizontal: theme.padding.large,
    backgroundColor: theme.colors.mediumGrey,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.purple,
    paddingHorizontal: theme.padding.medium,
    paddingVertical: theme.padding.large,
    ...theme.shadowAlternative,
  },
  modalOption: {
    paddingVertical: theme.padding.small,
    paddingHorizontal: theme.padding.small,
  },
  modalCancel: {
    marginTop: theme.padding.small,
    alignItems: "center",
  },
  operator: {
    paddingVertical: theme.padding.xsmall,
  },
  selectedOperator: {
    color: theme.colors.purple,
    paddingVertical: theme.padding.xsmall,
  },
});

export default styles;
