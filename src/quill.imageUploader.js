import FileEmbed from "./blots/file-embed.js";
import ImageThumbnailBlot from "./blots/image-thumbnail.js";
import LoadingImage from "./blots/image.js";
import Quill from "quill";
import Delta from "quill-delta";

import "./quill.imageUploader.css";

class ImageUploader {
    constructor(quill, options) {
        this.quill = quill;
        this.options = options;
        this.range = null;

        if (typeof this.options.upload !== "function")
            console.warn(
                "[Missing config] upload function that returns a promise is required"
            );

        var toolbar = this.quill.getModule("toolbar");
        toolbar.addHandler("image", this.selectLocalImage.bind(this));

        this.handleDrop = this.handleDrop.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.handleInsertFile = this.handleInsertFile.bind(this);

        this.quill.root.addEventListener("drop", this.handleDrop, false);
        this.quill.root.addEventListener("paste", this.handlePaste, false);
        this.quill.root.addEventListener( FileEmbed.optionClickEventName , e => this.handleFileEmbeddOptions(e), false);
    }

    handleFileEmbeddOptions(evt) {
        this.options.onOptionClick(evt).then( data => {
            if ( data.data.optionId === 'remove' && data.success ) {
                const optionDomNode = evt.optionDomNode;
                const e = new Event( FileEmbed.removeEventName );
                optionDomNode.dispatchEvent( e );
            }
        });
    }

    selectLocalImage() {
        this.range = this.quill.getSelection();
        this.fileHolder = document.createElement("input");
        this.fileHolder.setAttribute("type", "file");
        this.fileHolder.setAttribute("accept", "image/*");
        this.fileHolder.setAttribute("style", "visibility:hidden");

        this.fileHolder.onchange = this.fileChanged.bind(this);

        document.body.appendChild(this.fileHolder);

        this.fileHolder.click();

        window.requestAnimationFrame(() => {
            document.body.removeChild(this.fileHolder);
        });
    }

    handleDrop(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        if (
            evt.dataTransfer &&
            evt.dataTransfer.files &&
            evt.dataTransfer.files.length
        ) {
            if (document.caretRangeFromPoint) {
                const selection = document.getSelection();
                const range = document.caretRangeFromPoint(evt.clientX, evt.clientY);
                if (selection && range) {
                    selection.setBaseAndExtent(
                        range.startContainer,
                        range.startOffset,
                        range.startContainer,
                        range.startOffset
                    );
                }
            } else {
                const selection = document.getSelection();
                const range = document.caretPositionFromPoint(evt.clientX, evt.clientY);
                if (selection && range) {
                    selection.setBaseAndExtent(
                        range.offsetNode,
                        range.offset,
                        range.offsetNode,
                        range.offset
                    );
                }
            }

            this.range = this.quill.getSelection();
            let file = evt.dataTransfer.files[0];

            setTimeout(() => {
                this.range = this.quill.getSelection();
                this.readAndUploadFile(file);
            }, 0);
        }
    }

    handleInsertFile( file, range ) {
        setTimeout(() => {
            this.range = range
            this.readAndUploadFile(file);
        }, 0);
    }

    handlePaste(evt) {
        let clipboard = evt.clipboardData || window.clipboardData;

        // IE 11 is .files other browsers are .items
        if (clipboard && (clipboard.items || clipboard.files)) {
            let items = clipboard.items || clipboard.files;
            const IMAGE_MIME_REGEX = /^image\/(jpe?g|gif|png|svg|webp)$/i;

            for (let i = 0; i < items.length; i++) {
                if (IMAGE_MIME_REGEX.test(items[i].type)) {
                    let file = items[i].getAsFile ? items[i].getAsFile() : items[i];

                    if (file) {
                        this.range = this.quill.getSelection();
                        evt.preventDefault();
                        setTimeout(() => {
                            this.range = this.quill.getSelection();
                            this.readAndUploadFile(file);
                        }, 0);
                    }
                }
            }
        }
    }

    readAndUploadFile(file) {
        const fileReader = new FileReader();
        let base64ImageAdded = false;
        let uploaded = false;


        fileReader.addEventListener(
            "load",
            () => {
                // This timeout added to fix an issues related to angular zone.
                setTimeout(() => {
                    if ( !uploaded ) {
                        let base64ImageSrc = fileReader.result;
                        this.insertBase64Image(base64ImageSrc);
                        base64ImageAdded = true;
                    }
                }, 100 );
            },
        );

        if (file) {
            fileReader.readAsDataURL(file);
        }

        this.options.upload(file).then(
            (imageUrl) => {
                if ( base64ImageAdded ) {
                    this.removeBase64Image();
                }
                uploaded = true;
                this.insertToEditor(imageUrl);
            },
            (error) => {
                if ( base64ImageAdded ) {
                    this.removeBase64Image();
                }
                console.warn(error);
            }
        );
    }

    fileChanged() {
        const file = this.fileHolder.files[0];
        this.readAndUploadFile(file);
    }

    insertBase64Image(url) {
        if ( this.options && this.options.loadingImageUrl ) {
            url = this.options.loadingImageUrl;
        }
        const range = this.range;
        this.quill.insertEmbed(
            range.index,
            LoadingImage.blotName,
            `${url}`,
            "user"
        );
    }

    insertToEditor(data) {
        const range = this.range;
        // Insert the server saved image
        if ( data.type === 'file' ) {
            this.quill.insertEmbed(range.index, FileEmbed.blotName, data, "user");
        } else {
            this.quill.insertEmbed(range.index, "image", `${data.imgSrc || data.link}`, "user");
        }
        range.index++;
        this.quill.setSelection(range, "user");
    }

    removeBase64Image() {
        const range = this.range;
        this.quill.updateContents(new Delta()
            .retain(range.index)                  
            .delete( 1 )
        )
    }
}

Quill.register(FileEmbed, true);
Quill.register({ "formats/imageThumbnail": ImageThumbnailBlot });

window.ImageUploader = ImageUploader;
export default ImageUploader;