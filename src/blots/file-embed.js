import Quill from "quill";

const Embed = Quill.import("blots/embed");

class FileEmbedBlot extends Embed {
	static create(data) {
		const node = super.create('fuck');
        node.setAttribute("data-filedata", JSON.stringify( data ));
        const iconLable = document.createElement("span");
        iconLable.className = 'file-blot';
        iconLable.innerHTML = `
            <svg class="file-icon">
                <svg id="nu-ic-styles" viewBox="0 0 32 32"><use xlink:href="./assets/icons/symbol-defs.svg#${data.icon}"></use></svg>
            </svg>
            <span class="file-label">${data.label}</span>
        `;

        const moreOptContainer = document.createElement("span");
        moreOptContainer.className = 'more-opt-container';
        moreOptContainer.innerHTML = `
            <svg class="more-opt-icon">
                <svg id="nu-ic-styles" viewBox="0 0 32 32"><use xlink:href="./assets/icons/symbol-defs.svg#nu-ic-more"></use></svg>
            </svg>
        `;
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
        node.appendChild(iconLable);
        node.appendChild(moreOptContainer);
		return node;
	}

	static value(domNode) {
        return JSON.parse( domNode.getAttribute("data-filedata"));
	}

    constructor(scroll, node) {
        super(scroll, node);
        this.listners = [];
        this.domNode.addEventListener( FileEmbedBlot.removeEventName, event => {
            super.remove();
        });

        const data = JSON.parse( this.domNode.getAttribute("data-filedata"));
        this.domNode.querySelectorAll( '.file-embed-option' ).forEach( el => {
            const eventListner = el.addEventListener( 'click', event => {
                const id = el.getAttribute('data-id');
                const e = new Event( FileEmbedBlot.optionClickEventName );
                e.data = {
                    data,
                    optionId: id,
                };
                e.optionDomNode = this.domNode;
                this.scroll.domNode.dispatchEvent( e );
            });
            this.listners.push( eventListner );
        });
    }

    remove () {
        const data = JSON.parse( this.domNode.getAttribute("data-filedata"));
        const e = new Event( FileEmbedBlot.optionClickEventName );
        e.data = {
            data,
            optionId: 'remove',
        };
        e.optionDomNode = this.domNode;
        this.scroll.domNode.dispatchEvent( e );
    }
}

FileEmbedBlot.blotName = "fileEmbed";
FileEmbedBlot.tagName = "span";
FileEmbedBlot.className = "file-embed";

FileEmbedBlot.removeEventName = "quill-file-embed-remove";
FileEmbedBlot.optionClickEventName = "quill-file-embed-option";

Quill.register(FileEmbedBlot, true);

export default FileEmbedBlot;