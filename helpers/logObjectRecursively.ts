export function logObjectRecursively(obj: Record<string, unknown>, depth = 0) {
  const indent = "  ".repeat(depth); // Indentation for readability
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === "object" && value !== null) {
        console.log(`${indent}${key}: {`);
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          logObjectRecursively(value as Record<string, unknown>, depth + 1); // Recursively log nested objects
        }
        console.log(`${indent}}`);
      } else {
        console.log(`${indent}${key}: ${value}`);
      }
    }
  }
}
