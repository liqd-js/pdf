/* superscript / subscript
        const currentLineHeight = document.currentLineHeight(),
        currentY = document.y,
        originalOptionsY = options.y;
        document.font(originalFont, originalSize * 0.5);
        options.y = currentY + (currentLineHeight * 0.5);
        document.text(str, options);
        document.y = currentY;
        options.y = originalOptionsY;
        document.font(originalFont, originalSize);
        */