export default { title: 'Expand Button/Dimensions' };

export const fixedWidth = () => `
<button style="width: 200px;" type="button" class="expand-btn">
    <span class="expand-btn__cell">
        <span>Button with a lot of text that should just get taller and taller and taller</span>
        <svg class="icon icon--dropdown" focusable="false" height="8" width="8" aria-hidden="true">
            <use xlink:href="#icon-dropdown"></use>
        </svg>
    </span>
</button>
`;

export const fixedWidthAndHeight = () => `
<button style="width: 200px;" type="button" class="expand-btn expand-btn--fixed-height">
    <span class="expand-btn__cell expand-btn__cell--fixed-height">
        <span>Button with a lot of text that should wrap with some truncation</span>
        <svg class="icon icon--dropdown" focusable="false" height="8" width="8" aria-hidden="true">
            <use xlink:href="#icon-dropdown"></use>
        </svg>
    </span>
</button>
`;

export const fixedWidthAndHeightTruncated = () => `
<button style="width: 200px;" type="button" class="expand-btn expand-btn--fixed-height expand-btn--truncated">
    <span class="expand-btn__cell expand-btn__cell--fixed-height expand-btn__cell--truncated">
        <span>Button with a lot of text that should wrap with some truncation</span>
        <svg class="icon icon--dropdown" focusable="false" height="8" width="8" aria-hidden="true">
            <use xlink:href="#icon-dropdown"></use>
        </svg>
    </span>
</button>
`;

export const wide = () => `
<button type="button" class="expand-btn expand-btn--wide" aria-expanded="false">
     <span class="expand-btn__cell">
         <span>Button</span>
         <svg class="icon icon--dropdown" focusable="false" height="8" width="8" aria-hidden="true">
             <use xlink:href="#icon-dropdown"></use>
         </svg>
     </span>
 </button>
`;
