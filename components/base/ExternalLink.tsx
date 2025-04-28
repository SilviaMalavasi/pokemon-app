import { Link } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { type ComponentProps } from "react";
import { type ExternalPathString } from "expo-router";
import { Platform } from "react-native";
import { theme } from "@/style/ui/Theme";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string; color?: "default" | "alternative" };

export default function ExternalLink({ href, color = "default", ...rest }: Props) {
  const linkColor = color === "alternative" ? theme.colors.textAlternative : theme.colors.textHilight;
  return (
    <Link
      target="_blank"
      style={{ color: linkColor }}
      {...rest}
      href={href as ExternalPathString}
      onPress={async (event) => {
        if (Platform.OS !== "web") {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href);
        }
      }}
    />
  );
}
