import DOMPurify from "dompurify";
import { marked } from "marked"; // For Markdown parsing
// For CSV parsing
import invariant from "tiny-invariant";

/**
 * Type representing the parsed data.
 */
type ParsedData =
    | { type: "markdown"; content: string }
    | { type: "csv"; content: any[] }
    | { type: "text"; content: string };

/**
 * Sets up drag-and-drop functionality on a specified DOM element.
 * @param dropArea - The DOM element to attach drag-and-drop events.
 * @param onFileLoad - Callback function to handle the loaded file content.
 * @returns A cleanup function to remove event listeners.
 */
function setupDragAndDropFile(dropArea: HTMLElement): () => void {
    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        // make the cursor a drop effect, adds a + icon to the cursor
        invariant(e.dataTransfer, "Data transfer not available");
        e.dataTransfer.dropEffect = "copy";
    };

    const handleDragLeave = () => {
        // Remove the drag-over class when the user leaves the drop area
    };

    const handleDrop = async (e: DragEvent) => {
        e.preventDefault();

        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0]; // Get the first file
            console.log("Dropped file:", file);

            const reader = new FileReader();

            // Handle the file load event
            reader.onload = async (event) => {
                try {
                    const content = event.target?.result as string; // File content as string
                    const nodeType = getFileTypeFromUrl(file.name); // Determine the file type
                    const parsedData = parseContent(nodeType, content); // Parse the content
                    // Call the callback function with the parsed data
                    const node = usernode();
                    invariant(node, "No nexus found");
                    const nexus = useNexus(node.id);
                    invariant(nexus, "No nexus found");
                    nexus.create(
                        [{ type: nodeType, data: parsedData, name: file.name }],
                        { direction: "ad", type: "parent" }
                    );
                } catch (error) {
                    console.error("Error processing file:", error);
                }
            };

            // Read the file content as text
            reader.readAsText(file);
        }
    };

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);

    // Cleanup function to remove event listeners
    return () => {
        dropArea.removeEventListener("dragover", handleDragOver);
        dropArea.removeEventListener("dragleave", handleDragLeave);
        dropArea.removeEventListener("drop", handleDrop);
    };
}

type File<T extends NodeType> = {
    name: string;
    data: string;
    type: T;
};

/**
 * Loads a default file on application boot by fetching it from the server.
 * @param url - The URL of the default file to load.
 * @param onFileLoad - Callback function to handle the loaded file content.
 */
async function loadFile(url: string): Promise<File<NodeType>> {
    invariant(url, "No URL provided to load file");

    try {
        const response: Response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load file: ${response.statusText}`);
        }
        let content: string = await response.text();
        const fileType = getFileTypeFromUrl(url);
        if (fileType === "sec") {
            const rawHtml = marked(content);
            content = DOMPurify.sanitize(rawHtml);
        }
        // const parsedData = parseContent(fileType, content);
        // const data = parsedData.content;
        return {
            name: url,
            data: content,
            type: fileType,
        };
    } catch (error) {
        console.error("Error loading default file:", error);
        throw error;
    }
}

/**
 * Determines the file type based on the file extension.
 * @param url - The URL or file path.
 * @returns The MIME type as a string.
 */
function getFileTypeFromUrl(url: string): NodeType {
    const extension = url.split(".").pop()?.toLowerCase();
    switch (extension) {
        case "md":
            return "sec";
        case "csv":
            return "csv";
        default:
            console.warn(
                "Unknown file type, returning sec. Extension:",
                extension
            );
            return "sec";
    }
}

/**
 * Parses the content based on the file type.
 * @param fileType - The MIME type of the file.
 * @param content - The raw text content of the file.
 * @returns ParsedData object.
 */
function parseContent(fileType: NodeType, content: string): string {
    if (fileType === "sec") {
        const rawHtml = marked(content);
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);
        return sanitizedHtml;
    } else if (fileType === "csv") {
        return content;
        // const parsedCSV = Papa.parse(content, {
        //     header: true,
        //     dynamicTyping: true,
        // });
        // return { type: "csv", content: parsedCSV.data };
    } else {
        return content;
        // return { type: "text", content };
    }
}

export { loadFile, setupDragAndDropFile };
