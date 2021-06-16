import Quill from "quill";
import FileEmbedBlot from "./file-embed.js";
const Embed = Quill.import("blots/embed");

class ImageThumbnailBlot extends FileEmbedBlot {
	static createBlot(node, data) {
        node.setAttribute("data-filedata", JSON.stringify( data ));
        const container = document.createElement("span");
        container.className = 'image-thumbnail-blot';
        container.innerHTML = `<div class="image-thumbnail-div" style="background-image: url(${data.imgSrc || data.link})"></div>`;
        node.appendChild(container);

        const moreOptContainer = document.createElement("span");
        moreOptContainer.className = 'more-opt-container';
        moreOptContainer.innerHTML = `<svg class="more-opt-icon"><svg id="nu-ic-styles" viewBox="0 0 32 32"><use xlink:href="./assets/icons/symbol-defs.svg#nu-ic-more"></use></svg></svg>`;
        const options = document.createElement("span");
        options.className = 'more-opt';
        options.innerHTML = `<ul class="more-opt-list"></ul>`;

        ( data.options || [] ).forEach( opt => {
            const ul = options.querySelector('ul');
            const span = document.createElement("span");
            span.innerHTML = opt.label;
            span.setAttribute('data-id',opt.id);
            span.className = 'file-embed-option';
            ul.appendChild(span);
        });
        moreOptContainer.appendChild(options);
        node.appendChild(moreOptContainer);

		return node;
	}
}

ImageThumbnailBlot.blotName = "imageThumbnail";
ImageThumbnailBlot.tagName = "span";
ImageThumbnailBlot.className = "image-thumbnail";

export default ImageThumbnailBlot;