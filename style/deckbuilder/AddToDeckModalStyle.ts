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
    paddingVertical: theme.padding.medium,
  },
  deckName: {
    flex: 1,
    paddingBottom: theme.padding.small,
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.padding.xsmall,
  },
  qtyText: {
    color: theme.colors.purple,
    width: vw(12),
    paddingLeft: theme.padding.small,
    paddingBottom: theme.padding.small,
  },
  qtyOperator: {
    width: theme.padding.large,
    height: theme.padding.large,
    borderRadius: theme.borderRadius.xlarge,
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingBottom: theme.padding.xsmall,
    marginLeft: theme.padding.medium,
    marginTop: theme.padding.xsmall * -1,
  },
  deckPickerContainer: {
    marginBottom: theme.padding.small,
    width: "100%",
  },
  deckPickerLabel: {
    marginTop: theme.padding.small * -1,
  },
  pickerWrapper: {
    borderRadius: theme.borderRadius.small,
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
    paddingTop: theme.padding.medium,
    width: "100%",
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
