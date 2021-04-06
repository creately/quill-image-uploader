import Quill from "quill";
import FileEmbedBlot from "./file-embed.js";
const Embed = Quill.import("blots/embed");

class ImageThumbnailBlot extends FileEmbedBlot {
	static createBlot(node, data) {
        node.setAttribute("data-filedata", JSON.stringify( data ));
        const container = document.createElement("span");
        container.className = 'image-thumbnail-blot';
        container.innerHTML = `
            <div class="image-thumbnail-div" style="background-image: url(${data.link})"></div>
            <span class="remove-thumbnail file-embed-option" data-id="remove">x</span>`;
        node.appendChild(container);
		return node;
	}
}

ImageThumbnailBlot.blotName = "imageThumbnail";
ImageThumbnailBlot.tagName = "span";
ImageThumbnailBlot.className = "image-thumbnail";

export default ImageThumbnailBlot;