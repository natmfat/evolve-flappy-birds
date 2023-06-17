export function assert(value, message = "unknown assertion error") {
    if (!Boolean(value)) {
        throw typeof message === "string" ? new Error(message) : message;
    }
}
