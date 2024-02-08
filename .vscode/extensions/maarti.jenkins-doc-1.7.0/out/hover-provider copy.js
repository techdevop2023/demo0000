"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverProvider = void 0;
const extension_1 = require("./extension");
class HoverProvider {
    provideHover(document, position, token) {
        const wordRange = document.getWordRangeAtPosition(position);
        const hoveredWord = document.getText(wordRange);
        console.log(`Hovered word: ${hoveredWord}`);
        if (extension_1.docs.has(hoveredWord)) {
            return {
                contents: extension_1.docs.get(hoveredWord) || [],
            };
        }
        return null;
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=hover-provider%20copy.js.map