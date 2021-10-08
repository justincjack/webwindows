/*

Copyright 2021-2022 Justin Jack

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to deal 
in the Software without restriction, including without limitation the rights 
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
of the Software, and to permit persons to whom the Software is furnished to do 
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/**
 * 
 * Works with Chrome:
 * Version 93.0.4577.82
 * 
 * ----------------------------------------------------------------------------------------
 * Todo:
 * ----------------------------------------------------------------------------------------
 *      -   Need some easy selector functions for the content (by class) like:
 *          -   wnd.get_td( classname );
 *          -   wnd.get_input( classname );
 *          -   wnd.get_div( classname );
 *          -   wnd.get_table( classname );
 * 
 * ----------------------------------------------------------------------------------------
 * 
 * 
 * WINDOW class
 * --------------------------------------------------
 * A JavaScript window management system for Web applications.
 * 
 * To create a new window:
 * 
 * var wnd = WINDOW.create( < x-position>, <y-position>, <width>, <height>, <Title bar text> );
 * 
 * WINDOW Properties:
 * --------------------------------------------------------------------------------------------------
 * 
 * wnd.type                     - A user defined value to be able to diferentiate between types of
 *                                windows.
 * 
 * wnd.icon                     - Get/Set the window's titlebar icon.
 * 
 * wnd.background_color         - Get/Set the default background color of the window.
 * Default: "#d4f9fa" (light blue-ish)
 * 
 * wnd.titlebar_color_active    - Get/Set the color of the window's titlebar when it has focus
 * 
 * wnd.titlebar_color_inactive  - Get/Set the color of the window's titlebar when it does not have focus
 * 
 * wnd.text_color               - Get/Set the default text color of the window.
 * Default: "black";
 * 
 * 
 * wnd.font_size                - Get/Set the window's default font size.
 * Default: Empty string - size inherited.
 * 
 * 
 * wnd.title                    - Get/Set the text in the window's title bar.
 * Default: Empty string.
 * 
 * 
 * wnd.contents                 - SET:  If you're going to set the contents, you must
 *                                      set this property to an HTML string.  Internally,
 *                                      ".innerHTML" is called.
 *                              - GET:  Gives you direct access to the element that renders user-
 *                                      content inside the window.  You can apply styles, add
 *                                      children or whatever.
 * 
 *                                      Note:
 *                                      The "contents" are not displayed when the window is minimized.  
 *                                      To set the visible content of a minimized window, use the 
 *                                      "minimized_contents" property.
 * 
 * Default: Empty DOM element
 * 
 * 
 * wnd.minimized_contents       -   Behaves the same as the "contents" property but is only shown
 *                                  when the window is minimized.  There is very little space below
 *                                  the title bar to show content when a window is minimized, but
 *                                  it is accessible via this property.
 * Default: Empty DOM element
 * 
 * wnd.buttons                  -   Get/Set which control buttons are displayed in the upper-right-
 *                                  hand corner of the window.
 *                              Values:
 *                                  "both"      -   The window will have a close button and a minimize
 *                                                  button.
 *                                  "close"     -   The window will only have a close button, no
 *                                                  minimize button.
 *                                  "minimize"  -   The window will have a minimize button, but no
 *                                                  close button.
 *                                  "none"      -   The window will have no control buttons.
 * Default: "both"
 * 
 * 
 * wnd.resizable                -   Get/Set whether the window is resizable.  Resizable windows have
 *                                  a handle in the lower-right-hand corner that can be grabbed and 
 *                                  pulled by the user.
 * Default: true
 * 
 * WINDOW Methods:
 * --------------------------------------------------------------------------------------------------
 * 
 * show()
 * hide()
 * close()
 * minimize()
 * restore()
 * adjust_height_for_contents()
 * 
 * 
 * WINDOW Events:
 * --------------------------------------------------------------------------------------------------
 * 
 * 
 * 
 * 
 */


 String.prototype.toHTML = function() {
    return this.replace(/./gm, function(s) {
        return (s.match(/[a-z0-9\s]+/i)) ? s : "&#" + s.charCodeAt(0) + ";";
    });
};

var _window_tile_percentage     = 17;

const WINDOW_STATE_NORMAL       = 0;
const WINDOW_STATE_MINIMIZED    = 1;
const WINDOW_STATE_ANIMATING    = 2;
const WINDOW_STATE_INVISIBLE    = 3;
const WINDOW_STATE_INVALID      = 4;

const WM_STATE_MANAGED          = 0x00;
const WM_STATE_UNMANAGED        = 0x01;


const _win_active_color_    = "#6083eb";
const _win_inactive_color_  = "#8ea1ad";

const _window_tb_html =
`<tr>
    <td class='_wnd_icon_' style='padding-right: 1.15em; user-select: none;'>
        <img class='_wc_icon_bsy_' style='margin-top: 0.25em; opacity: 0; position: absolute; top: 0; z-index: 1; width: 1em; height: auto; vertical-align: middle; margin-left: 0.15em;' src='https://cybercrm.pro/dev/images/loading.gif' alt='X'>
        <img class='_wc_icon_img_' style='margin-top: 0.25em; opacity: 1; position: absolute; top: 0; z-index: 2; width: 1em; height: auto; vertical-align: middle; margin-left: 0.15em;' src='https://cybercrm.pro/dev/images/window.png' alt='X'>
    </td>
    <td class='_window_title_' style='font-size: 0.8vw; user-select: none;'><div class='_window_ttext_' style='vertical-align: middle; display: inline-block;'>&nbsp;</div></td>
    <td class='_window_min_' style='user-select: none;'>
        <img class='_wm_act_' style='opacity: 0; position: absolute; top: 0; z-index: 1; width: 1.5em; height: auto; vertical-align: middle; margin-right: 0.1em;' src='https://cybercrm.pro/dev/images/min_act_64.png' alt='-'>
        <img class='_wm_hov_' style='opacity: 0; position: absolute; top: 0; z-index: 2; width: 1.5em; height: auto; vertical-align: middle; margin-right: 0.1em;' src='https://cybercrm.pro/dev/images/min_hov_64.png' alt='-'>
        <img class='_wm_reg_' style='position: absolute; top: 0; z-index: 3; width: 1.5em; height: auto; vertical-align: middle; margin-right: 0.1em;' src='https://cybercrm.pro/dev/images/min_reg_64.png' alt='-'>
    </td>
    <td class='_window_close_' style='user-select: none;'>
        <img class='_wc_act_' style='opacity: 0; position: absolute; top: 0; z-index: 1; width: 1.5em; height: auto; vertical-align: middle; margin-right: 0.1em;' src='https://cybercrm.pro/dev/images/close_act_64.png' alt='X'>
        <img class='_wc_hov_' style='opacity: 0; position: absolute; top: 0; z-index: 2; width: 1.5em; height: auto; vertical-align: middle; margin-right: 0.1em;' src='https://cybercrm.pro/dev/images/close_hov_64.png' alt='X'>
        <img class='_wc_reg_' style='position: absolute; top: 0; z-index: 3; width: 1.5em; height: auto; vertical-align: middle; margin-right: 0.1em;' src='https://cybercrm.pro/dev/images/close_reg_64.png' alt='X'>
    </td>
    <td class='_header_btn_pad' style='width: 0.15em;'>&nbsp;</td>
</tr>`;

const _window_content_ =
`<svg    
    width="100%"
    height="100%"
    viewBox="0 0 ~cx~ ~cy~"
    preserveAspectRatio="xMinYMin meet">
    <foreignObject width="100%" height="100%" xmlns="http://www.w3.org/1999/xhtml">
    </foreignObject>
</svg>`;

/**
 * Helper class for HTML <select> elements.
 */
class SELECT {
    #onchange   = null;

    /**
     * Wrap a DOM SELECT element in this SELECT class.
     * 
     * @param {HTMLElement} elem 
     * @returns {SELECT}
     */
    static element( elem ) {
        let retval = null;

        if (!elem |
            !(elem instanceof HTMLElement))
        {
            return null;
        }

        retval = new SELECT(elem);
        return retval;
    }

    get rect() {
        return this.element.getBoundingClientRect();
    }

    set options_html( html ) {
        this.element.innerHTML = html;
    }

    get options_html() {
        return this.element.innerHTML;
    }

    get selected_index() {
        return this.element.selectedIndex;
    }

    set selected_index( index ) {
        index = parseInt(index);
        if (isNaN(index)) {
            return;
        }
        this.element.selectedIndex = index;
    }

    get selection() {
        let selel = this.element.options[this.element.selectedIndex];
        if (!selel ||
            !(selel instanceof HTMLElement))
        {
            return null;
        }
        return selel;
    }

    set selection( selector ) {
        let isel = parseInt(selector);

        if (typeof selector === 'number' ||
            isel.toString() === selector.toString())
        {
            this.element.selectedIndex = isel;
        }

    }

    set on_change( fx ) {
        if (typeof fx === 'function') {
            this.#onchange = fx;
        }
    }

    get on_change() {
        return this.#onchange;
    }

    /**
     * 
     * @returns The number of elements removed.
     */
    delete_all_options() {
        let opts    = this.element.options;
        let nopts   = opts.length;

        for (let i = nopts - 1; i >= 0; i--) {
            let opt = opts[i];
            opt.remove();
        }
        return nopts;
    }

    add_option( text, 
                attributes = {},
                classes = "",
                value = "")
    {
        let opt = document.createElement("option");
        let cl  = classes.split(" ");

        for (const prop in attributes) {
            opt.setAttribute(prop, attributes[prop]);
        }

        cl.forEach((c)=>{
            c = c.trim();
            if (c.length > 0) {
                opt.classList.add(c);
            }
        });

        if (value.trim().length > 0) {
            opt.value = value;
        }

        if (text.trim().length === 0) {
            if (text === " ") {
                opt.innerHTML = "&nbsp;";
            } else if (text.length > 0) {
                opt.innerHTML = text.toHTML();
            }
        } else {
            opt.innerHTML = text.toHTML();
        }
        this.element.appendChild(opt);
    }


    constructor( element ) {
        this.element    = element;
        this.#onchange  = null;


        this.element.addEventListener("change", (e)=>{
            if (this.#onchange) {
                this.#onchange(this);
            }
        });
    }


}

class CONTROL_BUTTON {
    #disabled = false;

    set_active_image() {
        if (this.#disabled) {
            if (this.img_disabled) {
                this.img_disabled.style.opacity = 1;
                this.img_regular.style.opacity = 0;
                this.img_hover.style.opacity = 0;
                this.img_active.style.opacity = 0;
            } else {
                this.img_regular.style.opacity = 1;
                this.img_hover.style.opacity = 0;
                this.img_active.style.opacity = 0;
            }
            return;
        }
        switch (this.active_image) {
            case this.img_regular:
                this.img_regular.style.opacity = 1;
                this.img_hover.style.opacity = 0;
                this.img_active.style.opacity = 0;
                break;
            case this.img_hover:
                this.img_regular.style.opacity = 0;
                this.img_hover.style.opacity = 1;
                this.img_active.style.opacity = 0;
                break;
            case this.img_active:
                this.img_regular.style.opacity = 0;
                this.img_hover.style.opacity = 0;
                this.img_active.style.opacity = 1;
                break;
        }
    }
    
    get disabled() {
        return this.#disabled;
    }

    set disabled( boolval ) {
        if (boolval === true) {
            this.#disabled = true;
        } else {
            this.#disabled = false;
        }
        this.set_active_image();
    }

    constructor(regular, 
                active, 
                hover, 
                onclick,
                parent,
                disabled_image = null,
                tooltip = "",
                enabled = true)
    {
        this.parent_window  = parent;
        this.element        = document.createElement("td");
        this.img_regular    = document.createElement("img");
        this.img_hover      = document.createElement("img");
        this.img_active     = document.createElement("img");
        this.img_disabled   = document.createElement("img");
        this.onclick        = onclick;


        /* Check that image params are correct and get them sorted */
        if (!regular ||
            typeof regular === 'undefined')
        {
            console.log("WINDOW::add_control_button() - ERROR: There is no \"url_img\" property given, so we don't know what button to draw!");
            return;
        }

        this.img_regular.src = regular;

        /* Here make this class create the button */

        if (!hover ||
            typeof hover === 'undefined')
        {
            hover = regular;
        }

        if (!active ||
            typeof active === 'undefined')
        {
            active = hover;
        }

        if (disabled_image === null) {
            disabled_image = regular;
        }

        /**********************************************************************************************************/
        if (enabled === false) {
            this.#disabled = true;
        } else {
            this.#disabled = false;
        }

        this.element.style.width = "1.5em";

        this.img_regular.src    = regular;
        this.img_hover.src      = hover;
        this.img_active.src     = active;
        this.img_disabled.src   = disabled_image;

        this.img_regular.style.opacity        = 1;
        this.img_regular.style.position       = "absolute";
        this.img_regular.style.top            = "0";
        this.img_regular.style.zIndex         = 1;
        this.img_regular.style.width          = "1.5em";
        this.img_regular.style.height         = "auto";
        this.img_regular.style.verticalAlign  = "middle"; 
        this.img_regular.style.marginRight    = "0.1em";
        this.img_regular.alt                  = "[]";
        this.img_regular.style.webkitUserDrag = "none";

        this.img_hover.style.opacity        = 0;
        this.img_hover.style.position       = "absolute";
        this.img_hover.style.top            = "0";
        this.img_hover.style.zIndex         = 2;
        this.img_hover.style.width          = "1.5em";
        this.img_hover.style.height         = "auto";
        this.img_hover.style.verticalAlign  = "middle"; 
        this.img_hover.style.marginRight    = "0.1em";
        this.img_hover.alt                  = "[]";
        this.img_hover.style.webkitUserDrag = "none";

        this.img_active.style.opacity        = 0;
        this.img_active.style.position       = "absolute";
        this.img_active.style.top            = "0";
        this.img_active.style.zIndex         = 3;
        this.img_active.style.width          = "1.5em";
        this.img_active.style.height         = "auto";
        this.img_active.style.verticalAlign  = "middle"; 
        this.img_active.style.marginRight    = "0.1em";
        this.img_active.alt                  = "[]";
        this.img_active.style.webkitUserDrag = "none";

        this.img_disabled.style.opacity        = 0;
        this.img_disabled.style.position       = "absolute";
        this.img_disabled.style.top            = "0";
        this.img_disabled.style.zIndex         = 4;
        this.img_disabled.style.width          = "1.5em";
        this.img_disabled.style.height         = "auto";
        this.img_disabled.style.verticalAlign  = "middle"; 
        this.img_disabled.style.marginRight    = "0.1em";
        this.img_disabled.alt                  = "[]";
        this.img_disabled.style.webkitUserDrag = "none";

        this.element.appendChild(this.img_regular);
        this.element.appendChild(this.img_hover);
        this.element.appendChild(this.img_active);
        this.element.appendChild(this.img_disabled);

        if (tooltip &&
            typeof tooltip === 'string' &&
            tooltip.length > 0)
        {
            this.element.title = tooltip;
        }
        
        this.element.style.userSelect = "none";

        this.active_image = this.img_regular;

        this.element.onmouseout     = (e)=>{
            this.active_image = this.img_regular;
            this.set_active_image();
            e.stopPropagation();
            return false;
        };

        this.element.onmouseup      = (e)=>{
            this.active_image = this.img_hover;
            this.set_active_image();
            e.stopPropagation();
            return false;
        };

        this.element.onmousedown    = (e)=>{
            this.active_image = this.img_active;
            this.set_active_image();
            e.stopPropagation();
            return false;
        };

        this.element.onmouseover    = (e)=>{
            if (e.buttons === 1) {
                this.active_image = this.img_active;
                this.set_active_image();
            } else {
                this.active_image = this.img_hover;
                this.set_active_image();
            }
            e.stopPropagation();
            return false;
        };

        this.element.onclick        = (e)=>{
            if (this.#disabled) {
                return true;
            }
            this.onclick();
            return false;
        };

        let insbef = ( (this.parent_window.custom_button_list.length === 0) ? this.parent_window.minimize_button : this.parent_window.custom_button_list[this.parent_window.custom_button_list.length - 1].element);
        this.parent_window.header.rows[0].insertBefore(this.element, insbef);
        this.parent_window.custom_button_list.push(this);
        this.set_active_image();
    }
}

class COLOR_VALUE {
    #red            = 0.00;
    #green          = 0.00;
    #blue           = 0.00;
    #alpha          = 1.00;
    #given_color    = "";

    get color() {
        return this.#given_color;
    }

    set color( colorspec ) {
        switch (colorspec) {
            case "black":
                this.#red   = 0;
                this.#green = 0;
                this.#blue  = 0;
                this.#alpha = 1.00;
                break;
            case "red":
                this.#red   = 255;
                this.#green = 0;
                this.#blue  = 0;
                this.#alpha = 1.00;
                break;
            case "green":
                this.#red   = 0;
                this.#green = 255;
                this.#blue  = 0;
                this.#alpha = 1.00;
                break;
            case "purple":
            case "magenta":
                this.#red   = 255;
                this.#green = 0;
                this.#blue  = 255;
                this.#alpha = 1.00;
                break;
            case "cyan":
                this.#red   = 0;
                this.#green = 255;
                this.#blue  = 255;
                this.#alpha = 1.00;
                break;
            case "blue":
                this.#red   = 0;
                this.#green = 0;
                this.#blue  = 255;
                this.#alpha = 1.00;
                break;
            case "yellow":
                this.#red   = 255;
                this.#green = 255;
                this.#blue  = 0;
                this.#alpha = 1.00;
                break;
            default:
                if (colorspec.charAt(0) === "#") {
                    let colors = colorspec.substr(1, (colorspec.length - 1));
                    if (colors.length === 6) {
                        let hred = colors.substr(0, 2);
                        let hgrn = colors.substr(2, 2);
                        let hblu = colors.substr(4, 2);

                        console.log("  Red: %s", hred);
                        console.log("Green: %s", hgrn);
                        console.log(" Blue: %s", hblu);

                        this.#red   = parseInt(hred, 16);
                        this.#green = parseInt(hgrn, 16);
                        this.#blue  = parseInt(hblu, 16);
                        this.#alpha = 1.00;
                    } else if (colors.length === 3) {
                        let hred = colors.charAt(0);
                        let hgrn = colors.charAt(1);
                        let hblu = colors.charAt(2);

                        hred = hred + hred;
                        hgrn = hgrn + hgrn;
                        hblu = hblu + hblu;

                        console.log("  Red: %s", hred);
                        console.log("Green: %s", hgrn);
                        console.log(" Blue: %s", hblu);

                        this.#red   = parseInt(hred, 16);
                        this.#green = parseInt(hgrn, 16);
                        this.#blue  = parseInt(hblu, 16);
                        this.#alpha = 1.00;
                    } else {
                        throw "Invalid color value given: \"" + colorspec + "\"...";
                    }
                    this.#check_color_vals();
                    break;
                } else if (colorspec.toLowerCase().indexOf("rgb") !== -1) {
                    this.#evaluate_rgb_string(colorspec);
                } else {
                    this.#evaluate_given_color(colorspec);
                }
                break;
        }
        this.#given_color = colorspec;
        return;
    }

    get value() {
        return "rgba(" + this.#red.toFixed(0) + "," +
                this.#green.toFixed(0) + "," +
                this.#blue.toFixed(0) + "," +
                this.#alpha.toFixed(2) + ")";
    }

    get given_color() {
        return this.#given_color;
    }

    #evaluate_rgb_string( rgb_string ) {

        if (!rgb_string ||
            typeof rgb_string !== 'string')
        {
            return;
        }

        rgb_string = rgb_string.trim();

        let ppos = rgb_string.indexOf("(");

        if (ppos === -1) {
            return;
        }

        ppos++;

        let ar_values = rgb_string.substr(ppos, (rgb_string.length - (ppos + 1))).split(",");

        if (ar_values &&
            Array.isArray(ar_values))
        {
            for (let i = 0; i < ar_values.length; i++) {
                let val = parseFloat(ar_values[i].trim());

                if (isNaN(val)) {
                    val = 0.00;
                }
                switch (i) {
                    case 0:
                        this.#red = val;
                        break;
                    case 1:
                        this.#green = val;
                        break;
                    case 2:
                        this.#blue = val;
                        break;
                    case 3:
                        this.#alpha = val;
                        break;
                    default:
                        break;

                }
            }
        }
        return;
    }

    #evaluate_given_color( color_string ) {
        let el = document.createElement("DIV");
        let st = el.style;

        st.width            = "10px";
        st.height           = "10px";
        st.backgroundColor  = color_string;

        st.opacity          = 0;
        st.position         = "fixed";
        st.top              = "0";
        st.left             = "0";

        document.body.appendChild(el);

        let cv = getComputedStyle(el).getPropertyValue("background-color");

        el.remove();

        this.#evaluate_rgb_string(cv);

        return;
    }

    #check_color_vals() {
        if (isNaN(this.#red)) {
            this.#red = 0.00;
        }

        if (isNaN(this.#green)) {
            this.#green = 0.00;
        }

        if (isNaN(this.#blue)) {
            this.#blue = 0.00;
        }

        if (isNaN(this.#alpha)) {
            this.#alpha = 1.00;
        }
        
        if (this.#red > 255) {
            this.#red = 255;
        } else if (this.#red < 0) {
            this.#red = 0;
        }
        
        if (this.#green > 255) {
            this.#green = 255;
        } else if (this.#green < 0) {
            this.#green = 0;
        }
        
        if (this.#blue > 255) {
            this.#blue = 255;
        } else if (this.#blue < 0) {
            this.#blue = 0;
        }

        if (this.#alpha > 1) {
            this.#alpha = 1.00;
        } else if (this.#alpha < 0 ) {
            this.#alpha = 0.00;
        }
    }

    constructor(red, 
                green   = 0.00,
                blue    = 0.00,
                alpha   = 1.00) 
    {
        if (typeof red === "string") {
            this.color = red;
            return;
        } else if (typeof red === 'number' ) {
            this.#red   = parseFloat(red);
            this.#green = parseFloat(green);
            this.#blue  = parseFloat(blue);
            this.#alpha = parseFloat(alpha);
            this.#check_color_vals();
            this.#given_color = this.value;
        } else if (typeof red === 'object' &&
                    red instanceof "COLOR_VALUE")
        {
            this.#red   = red.red;
            this.#green = red.green;
            this.#blue  = red.blue;
            this.#alpha = red.alpha;
            this.#given_color = this.value;
        } else {
            throw "Invalid parameter passed to COLOR_VALUE::constructor().\nValid values are a string 'red, blue, black...', a numeric value representing the percentage of RED color, or another COLOR_VALUE object.\n";
        }

    }
}

class WINDOW {
    static #window_list         = {};
    static #handle_generator    = 0;
    static #window_init         = false;
    static mouseX               = 0;
    static mouseY               = 0;
    static #base_index          = 0;
    static #minimized_count     = 0;            /* The number of currently minimized windows */
    static #wnd_with_focus      = null;         /* The window that currently has focus */
    static #minwin_width_perc   = 17.00;        /* The width of the minimized window tiles - a percentage of the screen width */
    static #minimize_map        = {};           /* An object whose properties keep track of minimized tiles */
    static #nmin_slots_per_row  = 0;            /* The number of minimized tiles that fit in each row */
    static #min_tile_width      = 0;            /* The width in pixels of each minimized tile */
    static #nmin_row_count      = 0;            /* The number of ROWS of minimized tiles */
    static #mintimer            = 0;

    /*--------------------  Class Instance Variables  --------------------*/
    #shadow_color               = new COLOR_VALUE("black");
    position                    = {};
    #user_content               = null;
    #control_button_cx          = "";
    #resize_obs                 = null;
    #onclose                    = null;
    #onresize                   = null;
    #onfocus                    = null;
    #onblur                     = null;
    #onminimize                 = null;
    #onrestore                  = null;
    #onscroll                   = null;
    #content                    = null;
    #minimized_content          = null;
    #vw_width                   = false;
    #vh_height                  = false;
    #vw_mult                    = -1.00;
    #vh_mult                    = -1.00;
    #resize_counter             = 0;
    #native_button_count        = 2;
    #content_size_relative      = false;
    #draggable                  = true;
    #management_state           = WM_STATE_MANAGED;

    static event_in_window( e ) {
        let el = e.target;
        for (   ;
                el &&
                el.tagName !== "HTML";
                el = el.parentElement)
        {
            if (typeof el.className === 'string' &&
                el.className.indexOf("window") !== -1) 
            {
                let w = WINDOW.get_window_by_element(el);
                if (w) {
                    return true;
                }
            }
        }
        return false;
    }


    static get has_focus() {
        return WINDOW.#wnd_with_focus;
    }

    static init() {
        if (WINDOW.#window_init === true) {
            return;
        }
        let wwidth  = window.innerWidth;

        WINDOW.window_init          = true;
        WINDOW.#minwin_width_perc   = _window_tile_percentage / 100;
        WINDOW.#min_tile_width      = (wwidth*WINDOW.#minwin_width_perc);
        WINDOW.#nmin_slots_per_row  = Math.floor(wwidth/((WINDOW.#min_tile_width * 0.80)));
        WINDOW.#nmin_row_count      = Math.ceil(WINDOW.#minimized_count/WINDOW.#nmin_slots_per_row);
        window.addEventListener("mouseup", (e)=>{
            if (!WINDOW.event_in_window(e)) {
                if (WINDOW.#wnd_with_focus) {
                    WINDOW.lost_focus(WINDOW.#wnd_with_focus);
                }
            }
            for (const id in WINDOW.#window_list) {
                if (WINDOW.#window_list[id].is_dragging) {
                    WINDOW.#window_list[id].stop_drag();
                    WINDOW.#window_list[id].position = WINDOW.#window_list[id].window.getBoundingClientRect();
                }
            }
        });

        /* Watch browser viewport for changes */
        window.addEventListener("resize", (e)=>{
            let cx = e.target.innerWidth;
            let cy = e.target.innerHeight;

            WINDOW.#min_tile_width      = (cx*WINDOW.#minwin_width_perc);
            WINDOW.#nmin_slots_per_row  = Math.floor(cx/((WINDOW.#min_tile_width * 0.80)));
            WINDOW.#nmin_row_count      = Math.ceil(WINDOW.#minimized_count/WINDOW.#nmin_slots_per_row);
            for (const id in WINDOW.#window_list) {
                if ( WINDOW.#window_list[id].state === WINDOW_STATE_NORMAL ) {
                    WINDOW.#window_list[id].bw_resize(cx, cy);
                } else if (WINDOW.#window_list[id].state === WINDOW_STATE_MINIMIZED) {
                    WINDOW.#window_list[id].minimize_position_set();
                }
            }
        });

        /* To check if another element - not a window - received focus to send
         * "focusout" events to all windows.
         */ 
        window.addEventListener("focusin", (e)=>{
            let el = e.target;
            for (   ;
                    el &&
                    el.tagName !== "HTML";
                    el = el.parentElement)
            {
                if (el.className.indexOf("window") !== -1) {
                    let w = WINDOW.get_window_by_element(el);
                    if (w) {
                        WINDOW.set_focus(w);
                    }
                    return;
                }
            }
            /* Here, something else got focus */
            if (WINDOW.#wnd_with_focus) {
                WINDOW.lost_focus(WINDOW.#wnd_with_focus);
            }
        });

        window.addEventListener("mousemove", (e)=>{
            WINDOW.mouseX = e.clientX;
            WINDOW.mouseY = e.clientY;
            for (const id in WINDOW.#window_list) {
                let mmw = WINDOW.#window_list[id];
                let ms  = mmw.get_management_state();

                if (mmw.is_dragging) {
                    if (e.buttons !== 1) {
                        mmw.stop_drag();
                        continue;
                    }

                    /* Stop drag before it goes off screen */
                    if ( (mmw.top - (mmw.dragY - WINDOW.mouseY)) <= 0 ) {
                        continue;
                    }

                    /**
                     * If the window is minimized and docked, make sure the user means
                     * to remove it from the dock.  If so, set it as unmanaged.
                     */
                    if (mmw.state === WINDOW_STATE_MINIMIZED &&
                        ms === WM_STATE_MANAGED)
                    {
                        if (Math.abs(Math.sqrt(Math.pow((WINDOW.mouseX - mmw.dragX), 2) + Math.pow((WINDOW.mouseY - mmw.dragY), 2))) < 5) {
                            return;
                        }
                        mmw.set_management_state(WM_STATE_UNMANAGED);
                        ms = WM_STATE_UNMANAGED;
                    }

                    mmw.left -= (mmw.dragX - WINDOW.mouseX);
                    mmw.top  -= (mmw.dragY - WINDOW.mouseY);

                    /**
                     * Unmanaged window's "minimized" positioning should always be the
                     * same as the windows top-left corner.
                     */
                    if ( ms === WM_STATE_UNMANAGED) {
                        mmw.set_minimize_pos(mmw.left, mmw.top, false);
                        mmw.set_window_pos(mmw.left, mmw.top, false);

                    }
                    mmw.window.style.left = (mmw.left).toString() + "px";
                    mmw.window.style.top  = (mmw.top).toString()  + "px";
                    mmw.dragX = WINDOW.mouseX;
                    mmw.dragY = WINDOW.mouseY;
                }
            }
        });
    }

    static get count() {
        return Object.keys(WINDOW.#window_list).length;
    }

    /**
     * Get the bounding client rect of the given element
     * or WINDOW object.
     * 
     * @param {WINDOW|HTMLElement} el 
     * @returns 
     */
    static rect_of( el ) {
        if (el instanceof WINDOW) {
            return el.rect;
        }
        return el.getBoundingClientRect();
    }


    /**
     * Add the newly-minimized window to the tail of the map and call:
     * wnd.minimize_position_set(index)
     * 
     * @param {WINDOW} wnd 
     * 
     * @returns {number}
     * Returns the index in the "minimize_map" of this window that's being minimized.
     * 
     */
    static map_minimized_window( wnd ) {
        let min_index   = 1;
        let map_keys    = Object.keys(WINDOW.#minimize_map);
        min_index       = map_keys.length + 1;
        WINDOW.#minimize_map[min_index] = wnd;
        return min_index;
    }

    static window_list() {
        for ( const id in WINDOW.#window_list) {
            console.log("Window ID: " + WINDOW.#window_list[id].id 
                + " has index: " + WINDOW.#window_list[id].index 
                + "  and z-index of: " + WINDOW.#window_list[id].window.style.zIndex); 
        }
    }

    static min_win_list() {
        console.log(WINDOW.#minimize_map);
    }

    /**
     * Setting a window's index should ALSO set its Z-index.  The Z-index is
     * the WINDOW.#base_index + the window's index.
     * 
     * This should also make sure there are no duplicate indexes, so all
     * existing indexes that are >= the window's OLD index and that are 
     * <= the windows NEW index should be decremented by ONE.
     * 
     * Indexing of the windows:
     * 
     * Minimized windows' indexes:   1-n
     * 
     * Normal windows' indexes are: (n+1) - z
     * 
     * 
     */
    static window_set_index( wnd, index ) {
        let newmap          = {};
        let window_array    = [];
        let inserted        = false;
        let i               = 0;
        let w               = null;
        let changes         = [];

        /**
         * Add all windows into this array except the
         * one we're assigning to a new index.
         */
        for (const id in WINDOW.#window_list) {
            if (WINDOW.#window_list[id].id === wnd.id) {
                continue;
            }
            window_array.push(WINDOW.#window_list[id]);
        }

        /* Sort visible windows */
        window_array.sort((a, b)=>{
            return a.index - b.index;
        });

        if (index >= 0) {
            wnd.index = index;
            wnd.zindex = WINDOW.#base_index + index;
        }

        for (let i = 0; i < window_array.length; i++) {
            if (index > 0 && 
                (i+1) >= index) 
            {
                window_array.splice(i, 0, wnd);
                inserted = true;
                for (let j = (i+1); j < window_array.length; j++ ) {
                    window_array[j].index = (j+1);
                    window_array[j].zindex = WINDOW.#base_index + (j+1);
                }
                break;
            }
            window_array[i].index = (i+1);
            window_array[i].zindex = WINDOW.#base_index + (i+1);
        }
        if (index > 0 &&
            inserted === false) 
        {
            window_array.push(wnd);
        }

        
        // for (   i = 0; 
        //         i < window_array.length &&
        //         (window_array[i].state !== WINDOW_STATE_NORMAL &&
        //         window_array[i].get_management_state() === WM_STATE_MANAGED);
        //         i++)
        // {
        //     newmap[window_array[i].index] = window_array[i];
        //     changes.push(window_array[i]);
        // }

        for (   i = 0; 
                i < window_array.length;
                i++)
        {
            w = window_array[i];
            if (w.state === WINDOW_STATE_NORMAL ||
                (w.state === WINDOW_STATE_MINIMIZED &&
                w.get_management_state() === WM_STATE_UNMANAGED))
            {
                continue;
            }

            newmap[w.index] = w;
            changes.push(window_array[i]);
        }


        WINDOW.#nmin_row_count  = Math.ceil( changes.length / WINDOW.#nmin_slots_per_row);
        WINDOW.#minimize_map = newmap;
        changes.forEach((w)=>{
            w.minimize_position_set(w.index);
        });
        return;
    }

    static add( wnd ) {
        WINDOW.#window_list[wnd.id] = wnd;
        WINDOW.#window_list[wnd.id].index  = WINDOW.count;
        WINDOW.#window_list[wnd.id].zIndex = WINDOW.count + WINDOW.#base_index;
        WINDOW.set_focus(wnd);
    }

    static get_top_window() {
        let lw = {
            wnd: null,
            index: 0
        };

        for (const id in WINDOW.#window_list) {
            if (WINDOW.#window_list[id].state === WINDOW_STATE_NORMAL) {
                if (WINDOW.#window_list[id].index > lw.index) {
                    lw.index    = WINDOW.#window_list[id].index;
                    lw.wnd      = WINDOW.#window_list[id];
                }
            }
        }
        return lw.wnd;
    }

    static lost_focus( wnd ) {
        if (WINDOW.#wnd_with_focus === wnd) {
            WINDOW.#wnd_with_focus.lost_focus();
            WINDOW.#wnd_with_focus = null;
        } else {
            wnd.lost_focus();
        }
    }

    static set_next_focus() {
        let w = WINDOW.get_top_window();
        if (w) {
            WINDOW.set_focus(w);
        }
    }

    /**
     * We need to bring the given window to the top.
     * 
     * function set_focus();
     * 
     */
    static set_focus( wnd ) {
        let oldwnd = WINDOW.#wnd_with_focus; 
        if (!wnd instanceof WINDOW) {
            return;
        }
        if (wnd === oldwnd) {
            return;
        }
        WINDOW.window_set_index(wnd, WINDOW.count);
        WINDOW.#wnd_with_focus = wnd;
        wnd.header.style.backgroundColor = wnd.titlecolor_active;
        wnd.gained_focus();
        if (oldwnd) {
            oldwnd.lost_focus();
        }
    }

    static set_base_zindex( val ) {
        if (!typeof val === 'number') {
            return;
        }
        WINDOW.#base_index = val;
        for (const id in WINDOW.#window_list) {
            WINDOW.#window_list[id].zindex = WINDOW.#base_index + WINDOW.#window_list[id].index;
        }
    }

    static get_window_by_id( id ) {
        if (WINDOW.#window_list.hasOwnProperty(id)) {
            return WINDOW.#window_list[id];
        }
        return null;
    }

    static get_window_by_element( element ) {
        let wid = 0;
        if (!element ||
            typeof element.id === 'undefined')
        {
            return null;
        }

        wid = parseInt(element.id);
        if (isNaN(wid)) {
            return null;
        }
        for (const id in WINDOW.#window_list) {
            if (WINDOW.#window_list[id].id === wid) {
                return WINDOW.#window_list[id];
            }
        }
        return null;
    }

    /**
     * Create a new window for content.
     * 
     * 
     * @param {string} x
     * The X, or "left" position of the window.
     * 
     * @param {string} y 
     * The Y, or "top" position of the window.
     * 
     * @param {string} cx 
     * The width of the window.
     * 
     * @param {string} cy 
     * The height of the window
     * 
     * @param {string} title 
     * The title of the window.
     * 
     * @returns WINDOW
     */
    static create( x, y, cx, cy, title = "") 
    {
        var wnd = new WINDOW(x, y, cx, cy, title);
        return wnd;
    }

    /************************************  Window Events  *************************************/

    set onclose( fx ) {
        if (typeof fx === 'function') {
            this.#onclose = fx;
            return true;
        }
        return false;
    }

    set onresize( fx ) {
        if (typeof fx === 'function') {
            this.#onresize = fx;
            return true;
        }
        return false;
    }

    set onfocus( fx ) {
        if (typeof fx === 'function') {
            this.#onfocus = fx;
            return true;
        }
        return false;
    }

    set onblur( fx ) {
        if (typeof fx === 'function') {
            this.#onblur = fx;
            return true;
        }
        return false;
    }

    set onminimize( fx ) {
        if (typeof fx === 'function') {
            this.#onminimize = fx;
            return true;
        }
        return false;
    }

    set onrestore( fx ) {
        if (typeof fx === 'function') {
            this.#onrestore = fx;
            return true;
        }
        return false;
    }

    /************************************  Window Properties  *************************************/

    get showing() {
        if (this.window.display === "none") {
            return false;
        }
        return true;
    }

    get is_showing() {
        return this.visible;
    }


    get opacity() {
        return this.window.style.opacity;
    }

    set opacity( opval ) {
        return this.window.style.opacity = opval;
    }

    get rect() {
        return this.window.getBoundingClientRect();
    }

    set show_busy( boolval ) {
        if (boolval === true) {
            if (this.busy_icon_showing === true) {
                return;
            }
            this.busy_icon_showing = true;
            this.busy_icon.style.opacity = 1;
            this.icon_image.style.opacity = 0;
            return;
        }

        if (this.busy_icon_showing === false) {
            return;
        }
        this.busy_icon_showing = false;
        this.busy_icon.style.opacity = 0;
        this.icon_image.style.opacity = 1;
    }

    get show_busy() {
        return this.busy_icon_showing;
    }

    get icon() {
        return this.icon_image.src;
    }

    set icon( icon_url ) {
        this.icon_image.src = icon_url; 
    }

    /**
     * Set the window's default background color.
     */
    set background_color( colorval ) {
        this.window.style.backgroundColor = colorval;
    }

    get background_color() {
        return this.window.style.backgroundColor;
    }

    /**
     * Set the window's default text color.
     */
    set text_color( colorval ) {
        this.window.style.color = colorval;
    }

    get text_color() {
        return this.window.style.color;
    }

    set titlebar_color( colorval ) {
        this.titlecolor_active = colorval;
        this.#update_window_colors();
    }

    set titlebar_color_active( colorval ) {
        this.titlecolor_active = colorval;
        this.#update_window_colors();
    }

    set title_color( colorval ) {
        this.title_bar_text.style.color = colorval;
    }

    get title_color() {
        return this.title_bar_text.style.color;
    }

    set titlebar_color_inactive( colorval ) {
        this.titlecolor_inactive = colorval;
        this.#update_window_colors();
    }

    get titlebar_color_inactive() {
        return this.titlecolor_inactive;
    }

    get titlebar_color_active() {
        return this.titlecolor_active;
    }

    /**
     * Set the window's default text size e.g.
     * "1em", "1vw"...
     */
    set font_size( sizeval ) {
        this.window.style.fontSize = sizeval;
    }

    get font_size() {
        return this.window.style.fontSize;
    }

    /**
     * Sets the title-bar text on a window.
     */
    set title( val ) {
        this.title_bar_text.innerText = val;
    }

    get title() {
        return this.title_bar_text.innerText;
    }

    set buttons( bstring ) {
        switch (bstring.toLowerCase()) {
            case "none":
                this.minimize_button.style.display  = "none";
                this.close_button.style.display     = "none";
                this.#native_button_count           = 0;
                break;
            case "close":
                this.close_button.style.display     = "table-cell";
                this.minimize_button.style.display  = "none";
                this.#native_button_count           = 1;
                break;
            case "minimize":
                this.close_button.style.display     = "none";
                this.minimize_button.style.display  = "table-cell";
                this.#native_button_count           = 1;
                break;
            case "both":
            default:
                this.close_button.style.display     = "table-cell";
                this.minimize_button.style.display  = "table-cell";
                this.#native_button_count           = 2;
                break;
        }
    }

    get buttons() {
        let cbs = ((this.close_button.style.display === "none")?false:true);
        let mbs = ((this.minimize_button.style.display === "none")?false:true);

        if (cbs &&
            mbs)
        {
            return "both";
        }
        if (cbs) return "close";
        if (mbs) return "minimize";
        return "none";
    }

    set resize_content( boolval ) {
        if (boolval === true) {
            if (this.#content_size_relative) {
                return;
            }
            /* Set content to self-resize */
            this.svg_containter = document.createElement("DIV");

            this.svg_containter.style.overflowX = "hidden";
            this.svg_containter.style.overflowY = "auto";
            this.svg_containter.style.width     = "100%";
            this.svg_containter.style.position  = "absolute";

            this.#content.style.overflowX       = "auto";
            this.#content.style.overflowY       = "auto";
            this.#content.style.width           = "100%";
            this.#content.style.position        = "relative";
            this.#content.style.top             = "";

            this.#content.xmlns = "http://www.w3.org/1999/xhtml";

            this.svg_containter.classList.add("win_svg");
            this.svg_containter.innerHTML = 
                _window_content_.replace("~cx~", this.content_width.toString())
                                .replace("~cy~", this.content_height.toString());

            this.svg            = this.svg_containter.querySelector("svg");
            this.foreign_object = this.svg_containter.querySelector("foreignObject");

            this.#content.replaceWith(this.svg_containter);
            this.foreign_object.appendChild(this.#content);
            this.#content_size_relative = true;
            this.#size();
            return;
        }
        /* Remove resizable content */
    }

    get selectable() {
        return this.#content.style.userSelect;
    }

    set selectable( boolval ) {
        if (boolval === false) {
            this.#content.style.userSelect = "none";
            this.#content.style.webkitUserSelect = "none";
            this.#content.style.mozUserSelect = "none";
            return;
        }
        this.#content.style.userSelect = "";
        this.#content.style.webkitUserSelect = "";
        this.#content.style.mozUserSelect = "";
        return;
    }

    /**
     * @param {string} html 
     * An HTML string used to create the elements inside the window
     * 
     */
    set contents( html ) {
        this.#content.innerHTML = html;
    }

    set cursor( cursor_type ) {
        this.#content.style.cursor = cursor_type;
    }


    /* Set the padding for the main content of the window */

    set padding_left( value ) {
        this.#content.style.paddingLeft = value;
    }
    
    set padding_right( value ) {
        this.#content.style.paddingRight = value;
    }
    
    set padding_top( value ) {
        this.#content.style.paddingTop = value;
    }
    
    set padding_bottom( value ) {
        this.#content.style.paddingBottom = value;
    }
    
    set padding( value ) {
        this.#content.style.padding = value;
    }

    /**
     * Returns the DOM element containing the content of the window.
     */
    get contents() {
        return this.#content;
    }

    /** Because some people like to use the singular noun XD */
    get content() {
        return this.#content;
    }

    get draggable() {
        return this.#draggable;
    }

    set draggable( boolval ) {
        if ( typeof boolval !== 'boolean') {
            return;
        }

        if (this.window_being_dragged === true &&
            boolval === false)
        {
            this.window_being_dragged = false;
        }
        this.#draggable = boolval;
    }

    /**
     * Return the DOM element that's displayed in the window's body when the window
     * is minimized.
     * 
     * You can apply styles to it or whatever you want.  It can be treated as a
     * normal DOM element.  
     * 
     */
    get minimized_contents() {
        return this.#minimized_content;
    }

    /**
     * @param {string} html
     * Pass an HTML string that will be applied to the content that's
     * shown below the title bar when a window is minimized.
     */
    set minimized_contents( html ) {
        this.#minimized_content.innerHTML = html;
    }

    set resizable( boolval ) {
        if (boolval === false) {
            this.window.style.resize = "none";
        } else {
            this.window.style.resize = "both";
        }
    }

    get resizable() {
        if (this.window.style.resize === "both") {
            return true;
        }
        return false;
    }

    get width() {
        return this.position.width;
    }

    set width( winwidth ) {
        this.window.style.winwidth = winwidth;
        this.#size();
    }

    get height() {
        return this.position.height;
    }

    get header_height() {
        return this.header_holder.clientHeight;
    }

    get header_width() {
        return this.header_holder.clientWidth;
    }


    set height( winheight ) {
        this.window.style.height = winheight;
        this.#size();
    }

    get shadow_color_object() {
        return this.#shadow_color;
    }

    get shadow_color() {
        return this.#shadow_color.given_color;
    }

    set shadow_color( colorspec ) {
        this.#shadow_color.color    = colorspec;
        this.window.style.boxShadow = "0px 0px 24px 2px " + this.#shadow_color.value;
    }

    /**********************************************************************************************/



    /*************************************  Window Methods  ***************************************/

    get_management_state() {
        return this.#management_state;
    }

    /**
     * Whether or not the window should be subject to the window
     * management system's auto-positioning.  If a minimized window
     * is dragged from its assigned spot, this will be called to
     * remove it from postion management.
     * 
     * 
     * @param {number} wm_state 
     * Either WM_STATE_UNMANAGED or WM_STATE_MANAGED
     * 
     * @returns {boolean}
     * TRUE on success, FALSE otherwise
     */
    set_management_state( wm_state ) {
        if (wm_state === this.#management_state) {
            return true;
        }

        if (wm_state === WM_STATE_UNMANAGED) {  /* Set the state to UN-managed */
            /**
             * Take the window off of position management.
             * 
             * If the window is not minimized, just make sure that when it IS
             * minimized, that if there's no minimize info saved, we shrink it
             * where it is.
             * 
             * If it IS minimized, we tell the window position management system
             * to rearrange the minimized windows.
             * 
             */
            this.min_drag_flag = true;
            this.#management_state = wm_state;

            if (this.state === WINDOW_STATE_MINIMIZED) {
                this.#clear_minimize_information();
                delete WINDOW.#minimize_map[this.index];
                WINDOW.#nmin_row_count  = Math.ceil( Object.keys(WINDOW.#minimize_map).length / WINDOW.#nmin_slots_per_row);
                WINDOW.set_focus(this);
                WINDOW.#minimized_count--;
            }
        } else if ( wm_state === WM_STATE_MANAGED) {
            this.min_drag_flag = false;
            /**
             * Making the window's minimized position managed.
             * 
             * If the window's minimized, put it in its proper place.
             * If not, just get it ready so it will be placed properly
             * on minimize.
             * 
             */
            this.#management_state = wm_state;

            if (this.state === WINDOW_STATE_MINIMIZED) {
                /* First, get our restore position */
                this.#clear_minimize_information();
        
                let idx = WINDOW.map_minimized_window(this);
        
                WINDOW.#nmin_row_count  = Math.ceil( idx / WINDOW.#nmin_slots_per_row);
        
                this.minimize_position_set(idx);
                if (this.minimize_information.info_valid === false) {
                    return;
                }
        
                this.window.style.resize        = "none";
                this.window.style.transition    = "all 250ms linear";
                let crect = this.window.getBoundingClientRect();
                this.window.style.left = crect.left + "px";
                this.window.style.top = crect.top + "px";
                this.state                              = WINDOW_STATE_ANIMATING;
                setTimeout(()=>{
                    this.close_button.style.display     = "none";
                    this.minimize_button.style.display  = "none";
                    this.#content.style.display         = "none";
                    this.#minimized_content.style.display
                                                        = "block";
        
                    this.window.style.width             = this.minimize_information.min_width.toString() + "px";
                    this.window.style.height            = this.minimize_information.min_height.toString() + "px";
                    this.window.style.left              = this.minimize_information.x.toString() + "px";
                    this.window.style.top               = this.minimize_information.y.toString() + "px";
                }, 50);

                setTimeout(()=>{
                    this.state = WINDOW_STATE_MINIMIZED;
                    this.window.style.transition    = "none";
                    WINDOW.#minimized_count++;
                    WINDOW.window_set_index(this, idx);
                }, 250);
            }
        } else {
            return false;
        }
        return true;
    }

    adjust_height_for_contents() {
        let cheight     = 0;
        let prev_opac   = this.window.style.opacity;
        let prev_disp   = this.window.style.display;

        this.window.style.opacity   = 0;
        this.window.style.display   = "block";

        if (!this.#content.children) {
            return;
        }

        let chlen = this.#content.children.length;

        if (chlen === 0) {
            return;
        }

        cheight = this.header_height*2;

        for (let i = 0; i < chlen; i++) {
            let tempe = this.#content.children[i];
            let trect = tempe.getBoundingClientRect();
            cheight+=trect.height;
        }

        let max_height = (window.innerHeight * 0.9);

        if (cheight > max_height) {
            cheight = max_height;
        }

        this.height = cheight.toString() + "px";
        this.window.style.opacity   = prev_opac;
        this.window.style.display   = prev_disp;
    }

    /**
     * function show();
     */
    show() {
        if (this.state === WINDOW_STATE_INVALID) {
            return;
        }
        if (this.center_x ||
            this.center_y)
        {
            this.window.style.opacity   = 0;
            this.window.style.display   = "block";
            let wwidth = this.window.clientWidth;
            let wheight = this.window.clientHeight;

            if (this.center_x) {
                this.window.style.left = ((window.innerWidth / 2) - (wwidth / 2)).toString() + "px";
                this.center_x = false;
            }

            if (this.center_y) {
                this.window.style.top = ((window.innerHeight / 2) - (wheight / 2)).toString() + "px";
                this.center_y = false;
            }

        }
        this.window.style.opacity   = 1;
        this.window.style.display   = "block";
        this.state                  = this.previous_state;
        return this;
    }

    /**
     * function hide();
     * 
     */
    hide() {
        if (this.state === WINDOW_STATE_INVALID) {
            return;
        }
        this.window.style.opacity   = 0;
        this.window.style.display   = "none";
        this.previous_state         = this.state;
        this.state                  = WINDOW_STATE_INVISIBLE;
        return this;
    }

    /**
     * function close();
     */
    close() {
        if (this.state === WINDOW_STATE_INVALID) {
            return;
        }
        this.state = WINDOW_STATE_INVALID;
        if (this.state === WINDOW_STATE_ANIMATING ||
            this.state === WINDOW_STATE_MINIMIZED)
        {
            WINDOW.#minimized_count--;
            WINDOW.window_set_index(this, 0);
        }
        this.state = WINDOW_STATE_INVISIBLE;
        if (this.#onclose) {
            this.#onclose(this);
        }
        this.#destroy();
        return true;
    }

    /**
     * 
     * This function is responsible for:
     *  A.  Sizing the minimized windows correctly
     *  B.  Setting the X and Y position of the window when
     *      it's minimized.
     * 
     * It's called whenever:
     *  A.  THIS window is minimized.
     *  B.  The viewport size is adjusted.
     *  C.  ANY managed window is restored.
     * 
     */
    minimize_position_set( new_index = null ) {
        let header_rect = this.header_holder.getBoundingClientRect();

        if (new_index === null) {
            if (this.minimize_information.info_valid === false ||
                this.minimize_information.slot === null ||
                this.minimize_information.slot === 0)
            {
                return { info_valid: false, slot: null};
            }
            new_index = this.minimize_information.slot;
        }

        let row         = ((Math.ceil(new_index/WINDOW.#nmin_slots_per_row)) - 1);
        let rowcount    = (WINDOW.#nmin_row_count === 0?1:WINDOW.#nmin_row_count);
        let wheight     = window.innerHeight;
        let mw_height   = (header_rect.height * 2);

        /* Logical Row */
        let lrow        = (rowcount - row);

        let min_info = {
            info_valid:         true,
            slot:               new_index,
            min_width:          WINDOW.#min_tile_width,
            min_height:         mw_height,
            ignore_due_to_drag: this.min_drag_flag,
            row:                row, 
            x:                  ((WINDOW.#min_tile_width * 0.8) * ((new_index - 1) % WINDOW.#nmin_slots_per_row)),
            y:                  wheight - (mw_height * lrow),
            last_viewport_cx:   window.innerWidth,
            last_viewport_cy:   wheight
        };

        let action_reqd = false;

        /**
         * Check to see if the calculated minimized position of this window is
         * the same as it was last time it was calculated and positioned.
         */
        for (const prop in min_info) {
            if (this.minimize_information.hasOwnProperty(prop)) {
                if (this.minimize_information[prop] !== min_info[prop]) {
                    this.minimize_information[prop] = min_info[prop];
                    action_reqd = true;
                }
            }
        }
        /* We've copied all the info to our instance "minimize_information" object */
        if (action_reqd === false ||
            min_info.ignore_due_to_drag === true ||
            this.state !== WINDOW_STATE_MINIMIZED)
        {
            return;
        }

        this.window.style.transition    = "all 250ms linear";
        setTimeout(()=>{
            this.window.style.width         = this.minimize_information.min_width.toString() + "px";
            this.window.style.height        = this.minimize_information.min_height.toString() + "px";
            this.window.style.left          = this.minimize_information.x.toString() + "px";
            this.window.style.top           = this.minimize_information.y.toString() + "px";
        }, 50);

        setTimeout(()=>{
            this.window.style.transition    = "none";
        }, 250);

        return min_info;
    }

    #clear_minimize_information() {
        if ( this.#management_state === WM_STATE_MANAGED ) {
            this.minimize_information = {
                info_valid:         false,
                slot:               0,
                min_width:          0,
                min_height:         0,
                ignore_due_to_drag: false,
                row:                0,
                x:                  0,
                y:                  0,
                last_viewport_cx:   0,
                last_viewport_cy:   0
            };
        } else {
            let header_rect = this.header_holder.getBoundingClientRect();
            let wheight     = window.innerHeight;
            let mw_height   = (header_rect.height * 2);

            this.minimize_information.ignore_due_to_drag    = true;
            this.minimize_information.info_valid            = true;
            this.minimize_information.slot                  = 0;
            this.minimize_information.row                   = 0;
            this.minimize_information.rowcount              = 0;

            if (this.minimize_information.min_width === 0) {
                this.minimize_information.min_width             = WINDOW.#min_tile_width;
            }

            if (this.minimize_information.min_height === 0 ) {
                this.minimize_information.min_height            = mw_height;
            }

            this.minimize_information.last_viewport_cx      = window.innerWidth;
            this.minimize_information.last_viewport_cy      = wheight;
        }
    }

    #update_window_colors() {
        if (WINDOW.#wnd_with_focus === this) {
            this.header.style.backgroundColor = this.titlecolor_active;
        } else {
            this.header.style.backgroundColor = this.titlecolor_inactive;
        }
    }

    #minimize_unmanaged() {
        if (this.state === WINDOW_STATE_INVALID &&
            this.state !== WINDOW_STATE_MINIMIZED)
        {
            return;
        }

        /* First, get our restore position */
        let crect = this.window.getBoundingClientRect();

        this.restore_position.top = crect.top;
        this.restore_position.y = crect.top;
        this.restore_position.left = crect.left;
        this.restore_position.x = crect.left;
        this.restore_position.width = crect.width;
        this.restore_position.height = crect.height;


        this.#clear_minimize_information();

        this.window.style.resize        = "none";
        this.window.style.transition    = "all 250ms linear";
        this.window.style.left = this.restore_position.left + "px";
        this.window.style.top = this.restore_position.top + "px";
        WINDOW.lost_focus(this);
        
        this.state                              = WINDOW_STATE_ANIMATING;
        setTimeout(()=>{
            this.close_button.style.display     = "none";
            this.minimize_button.style.display  = "none";
            this.#content.style.display         = "none";
            this.#minimized_content.style.display
                                                = "block";

            this.window.style.width             = this.minimize_information.min_width.toString() + "px";
            this.window.style.height            = this.minimize_information.min_height.toString() + "px";
            this.window.style.left              = this.minimize_information.x.toString() + "px";
            this.window.style.top               = this.minimize_information.y.toString() + "px";
        }, 50);
        setTimeout(()=>{
            this.state = WINDOW_STATE_MINIMIZED;
            this.window.style.transition    = "none";
            if (this.#onminimize) {
                this.#onminimize(this);
            }
        }, 250);
        return true;
    }

    /**
     * function minimize();
     * 
     * This is supposed to:
     *  -   Check with the class' minimization system to obtain
     *      the slot/position it's supposed to occupy.
     *  -   The class' system will assign a position (1-n) and call
     *      .minimize_position_set() so that the instance can figure
     *      out where it's going to put the minimized window.
     *  -   Then this method, "minimize()", will move the window
     *      into its minimized position.
     * 
     */
    minimize() {
        if (this.state === WINDOW_STATE_INVALID &&
            this.state !== WINDOW_STATE_MINIMIZED)
        {
            return;
        }

        if (this.#management_state === WM_STATE_UNMANAGED) {
            return this.#minimize_unmanaged();
        }

        /* First, get our restore position */
        this.#clear_minimize_information();
        let crect = this.window.getBoundingClientRect();

        this.restore_position.top = crect.top;
        this.restore_position.y = crect.top;
        this.restore_position.left = crect.left;
        this.restore_position.x = crect.left;
        this.restore_position.width = crect.width;
        this.restore_position.height = crect.height;

        let idx = WINDOW.map_minimized_window(this);

        WINDOW.#nmin_row_count  = Math.ceil( idx / WINDOW.#nmin_slots_per_row);

        this.minimize_position_set(idx);

        if (this.minimize_information.info_valid === false) {
            return;
        }

        this.window.style.resize        = "none";
        this.window.style.transition    = "all 250ms linear";
        this.window.style.left = this.restore_position.left + "px";
        this.window.style.top = this.restore_position.top + "px";
        WINDOW.lost_focus(this);
        
        this.state                              = WINDOW_STATE_ANIMATING;

        setTimeout(()=>{
            this.close_button.style.display     = "none";
            this.minimize_button.style.display  = "none";
            this.#content.style.display         = "none";
            this.#minimized_content.style.display
                                                = "block";

            this.window.style.width             = this.minimize_information.min_width.toString() + "px";
            this.window.style.height            = this.minimize_information.min_height.toString() + "px";
            this.window.style.left              = this.minimize_information.x.toString() + "px";
            this.window.style.top               = this.minimize_information.y.toString() + "px";
        }, 50);

        setTimeout(()=>{
            let nextwnd = WINDOW.get_top_window();
            this.state = WINDOW_STATE_MINIMIZED;
            this.window.style.transition    = "none";
            WINDOW.#minimized_count++;
            WINDOW.window_set_index(this, idx);
            if (nextwnd) WINDOW.set_focus(nextwnd);
            if (this.#onminimize) {
                this.#onminimize(this);
            }
        }, 250);
        return true;
    }

    set_window_pos( x, y, redraw_if_req = true ) {
        if (typeof x !== 'number' ||
            typeof y !== 'number')
        {
            return;
        }

        this.restore_position.top = y;
        this.restore_position.left = x;

        if (this.state === WINDOW_STATE_NORMAL &&
            redraw_if_req === true)
        {
            /* Move the minimized window */
            let crect = this.window.getBoundingClientRect();

            this.window.style.transition    = "all 250ms linear";
            this.window.style.left          = crect.left + "px";
            this.window.style.top           = crect.top + "px";
            setTimeout(()=>{
                this.window.style.left              = x.toString() + "px";
                this.window.style.top               = y.toString() + "px";
            }, 50);
            setTimeout(()=>{
                this.window.style.transition    = "none";
            }, 250);
        }


    }

    set_minimize_pos( x, y, redraw_if_req = true ) {

        if (this.#management_state === WM_STATE_MANAGED) {
            this.set_management_state(WM_STATE_UNMANAGED);
        }

        if (typeof x !== 'number' ||
            typeof y !== 'number')
        {
            return;
        }

        this.minimize_information.x = x;
        this.minimize_information.y = y;

        if (this.state === WINDOW_STATE_MINIMIZED &&
            redraw_if_req === true)
        {
            /* Move the minimized window */
            let crect = this.window.getBoundingClientRect();

            this.window.style.transition    = "all 250ms linear";
            this.window.style.left          = crect.left + "px";
            this.window.style.top           = crect.top + "px";
            setTimeout(()=>{
                this.window.style.left              = this.minimize_information.x.toString() + "px";
                this.window.style.top               = this.minimize_information.y.toString() + "px";
            }, 50);
            setTimeout(()=>{
                this.window.style.transition    = "none";
            }, 250);
        }
    }

    #restore_unmanaged() {
        return new Promise( (resolve, reject)=>{
            if (this.state === WINDOW_STATE_INVALID ||
                this.state !== WINDOW_STATE_MINIMIZED)
            {
                reject("Window is not minimized");
                return;
            }
            this.window.style.resize        = "both";
            this.window.style.transition    = "all 250ms linear";
            this.window.style.zIndex = WINDOW.#base_index + WINDOW.count;
            setTimeout(()=>{
                this.close_button.style.display     = "table-cell";
                this.minimize_button.style.display  = "table-cell";
                this.#minimized_content.style.display
                                                    = "none";

                /**
                 * If restoring the window puts some of it off-screen,
                 * restore it to be visible.
                 */

                let wwidth  = window.innerWidth;
                let wheight = window.innerHeight;
                let x       = 0;
                let y       = 0;


                if ( this.restore_position.left + this.restore_position.width > wwidth ) {
                    if ( (x = (wwidth - this.restore_position.width)) < 0 ) {
                        x = 0;
                    }
                } else {
                    x = this.restore_position.left;
                }

                if ( this.restore_position.top + this.restore_position.height > wheight ) {
                    if ( (y = (wheight - this.restore_position.height)) < 0 ) {
                        y = 0;
                    }
                } else {
                    y = this.restore_position.top;
                }
                this.window.style.width             = this.restore_position.width + "px";
                this.window.style.height            = this.restore_position.height + "px";
                this.window.style.top               = y.toString() + "px";
                this.window.style.left              = x.toString() + "px";
            }, 50);
            setTimeout(()=>{
                this.#content.style.display     = "block";
                this.window.style.transition    = "none";
                this.state                      = WINDOW_STATE_NORMAL;
                WINDOW.set_focus(this);
                if (this.#onrestore) {
                    this.#onrestore(this);
                }
                resolve(this);
            }, 250);
        });        
    }

    /**
     * function restore();
     */
    restore() {
        if (this.#management_state === WM_STATE_UNMANAGED) {
            return this.#restore_unmanaged();
        }

        return new Promise( (resolve, reject)=>{
            if (this.state === WINDOW_STATE_INVALID ||
                this.state !== WINDOW_STATE_MINIMIZED)
            {
                reject("Window is not minimized");
                return;
            }
            this.window.style.resize        = "both";
            this.window.style.transition    = "all 250ms linear";
            this.window.style.zIndex = WINDOW.#base_index + WINDOW.count;
            setTimeout(()=>{
                this.close_button.style.display     = "table-cell";
                this.minimize_button.style.display  = "table-cell";
                this.#minimized_content.style.display
                                                    = "none";
                this.window.style.width             = this.restore_position.width + "px";
                this.window.style.height            = this.restore_position.height + "px";
                this.window.style.top               = this.restore_position.top + "px";
                this.window.style.left              = this.restore_position.left + "px";
            }, 50);
            setTimeout(()=>{
                this.min_drag_flag              = false;
                this.#content.style.display     = "block";
                this.window.style.transition    = "none";
                this.state                      = WINDOW_STATE_NORMAL;
                this.#clear_minimize_information();
                delete WINDOW.#minimize_map[this.index];
                WINDOW.#nmin_row_count  = Math.ceil( Object.keys(WINDOW.#minimize_map).length / WINDOW.#nmin_slots_per_row);
                WINDOW.set_focus(this);
                WINDOW.#minimized_count--;
                if (this.#onrestore) {
                    this.#onrestore(this);
                }
                resolve(this);
            }, 250);
        });
    }


    /**********************************************************************************************/
    /*                                  DOM Helper Functions                                      */
    /**********************************************************************************************/


    /**
     * Helper function to get a requested DOM element inside the user area of the 
     * window.
     * 
     * @param {string} type 
     * The "type" of element you're looking for e.g. "input", "select", "textarea", "div"
     * 
     * @param {string|Array} classes 
     * Either a string containing a class name, or an array of class names to look
     * for pertaining to the "type" of element specified in the first parameter.
     * 
     * Example HTML:
     * <input class='my-field name' />
     * 
     * 
     * Example usage:
     * var my_element = window.get_element( "input", 
     *                                      [
     *                                          "my-field", 
     *                                          "name"
     *                                      ]);
     * 
     * or
     * 
     * var my_element = window.get_element( "input", "my-field");
     * 
     * 
     * @returns {Array}
     * Returns an array of elements matching the given parameters.
     */
    get_element(type, 
                classes = null) 
    {
        let classlist       = "";
        let element_search  = "";

        if (!type ||
            typeof type === 'undefined')
        {
            return null;
        }

        if ( Array.isArray(classes) ) {
            classes.forEach((c)=>{
                if (c.trim().length === 0) return;
                classlist+="."+c;
            });
        } else if (typeof classes === 'string') {
            if (classes.substr(0, 1) !== ".") {
                classlist = "." + classes;
            } else {
                classlist = classes;
            }
        }
        element_search = type + classlist;
        return this.#content.querySelectorAll(element_search);
    }

    get_single_element( type, 
                        classes = null ) 
    {
        let a = this.get_element(type, classes);
        if (a &&
            typeof a !== 'undefined' &&
            a.length > 0)
        {
            return a[0];
        }
        return null;
    }

    get_button( classname ) {
        let el = this.get_element("button", classname);
        return (( el && el.length > 0)?el[0]:null);
    }

    get_div( classname ) {
        let el = this.get_element("div", classname);
        return (( el && el.length > 0)?el[0]:null);
    }

    get_table( classname ) {
        let el = this.get_element("table", classname);
        return (( el && el.length > 0)?el[0]:null);
    }

    get_input( classname ) {
        let el = this.get_element("input", classname);
        return (( el && el.length > 0)?el[0]:null);
    }

    get_textarea( classname ) {
        let el = this.get_element("textarea", classname);
        return (( el && el.length > 0)?el[0]:null);
    }

    get_td( classname ) {
        let el = this.get_element("td", classname);
        return (( el && el.length > 0)?el[0]:null);
    }

    get_tr( classname ) {
        let el = this.get_element("tr", classname);
        return (( el && el.length > 0)?el[0]:null);
    }

    get_span( classname ) {
        let el = this.get_element("span", classname);
        return (( el && el.length > 0)?el[0]:null);
    }

    get_select( classname ) {
        let el = this.get_element("select", classname);
        return (( el && el.length > 0)?SELECT.element(el[0]):null);
    }


    /**********************************************************************************************/


    /*********************   Internal or private methods that shouldn't be used   *****************/


    set zindex( val ) {
        if (!typeof val === 'number') {
            return;
        }
        this.window.style.zIndex = val;
    }

    get is_dragging() {
        return this.window_being_dragged;
    }

    stop_drag() {
        this.window_being_dragged = false;   
    }

    #onfocusout() {
        if (this.#onblur) {
            this.#onblur(this);
        }
    }

    lost_focus() {
        this.header.style.backgroundColor = this.titlecolor_inactive;
        this.#onfocusout();
    }

    #onfocusin() {
        if (this.#onfocus) {
            this.#onfocus(this);
        }
    }

    gained_focus() {
        this.#onfocusin();
    }

    #destroy() {
        if (this.state === WINDOW_STATE_INVALID) {
            return;
        }
        delete WINDOW.#window_list[this.id];
        this.window.remove();
        this.state = WINDOW_STATE_INVALID;
    }

    get #control_button_count() {
        return (this.#native_button_count + this.custom_button_list.length);
    }

    trigger_resize() {
        this.#size();
    }

    /**
     * function #size();
     * function size();
     */
    #size( user_resize = false ) 
    {
        let pos     = this.position = this.window.getBoundingClientRect();
        let tb_rect = this.title_bar.getBoundingClientRect();
        let wwidth  = window.innerWidth;
        let wheight = window.innerHeight;
       
        if (this.state !== WINDOW_STATE_NORMAL &&
            this.state !== WINDOW_STATE_MINIMIZED)
        {
            return this;
        }

        /* Width of title bar is         window width - ( (Width of control buttons   + The ICON's width))                  
                                                            x the number of buttons )                                           */
        this.title_bar_text.style.width = 
            (pos.width - ((this.#control_button_cx*this.#control_button_count)+this.icon_td.clientWidth) ).toString() + "px";

        this.#minimized_content.style.height = (pos.height - tb_rect.height).toString() + "px";

        this.#minimized_content.style.top = (tb_rect.height) + "px";

        if (this.#content_size_relative === false) {
            this.#content.style.top = (tb_rect.height) + "px";
            this.#content.style.height = (pos.height - tb_rect.height).toString() + "px";
        } else {
            this.svg_containter.style.top = (tb_rect.height) + "px";
        }


        /* If size relative to the browser's viewport was given, convert the dimensions to the browser still resizes them */
        if (user_resize === true || 
            this.#vw_mult === -1.00) 
        {
            this.#vw_mult = pos.width / wwidth;
            this.#vh_mult = pos.height / wheight;
        }
        /*******************************************************************************************************************/

        this.content_width  = pos.width;
        this.content_height = pos.height - tb_rect.height;

        if (this.#onresize) {
            this.#onresize(this);
        }
        return this;
    }

    #calc( u ) {
        let lc = u.toString().trim().substr(-1);

        if (lc.length === 0) return 0;

        if (lc.charCodeAt(0) >= 48 &&
            lc.charCodeAt(0) <= 57)
        {
            return u + "px";
        }
        return u;
    }

    /**
     * Called when the browser's window is resized.
     * 
     * @param {number} width 
     * @param {number} height 
     */
    bw_resize( width, height ) {
        let inc_rsc = false;

        if (this.#vw_width &&
            this.#vw_mult !== -1.00)
        {
            inc_rsc = true;
            this.window.style.width = (width * this.#vw_mult).toString() + "px";
        }

        if (this.#vh_height &&
            this.#vh_mult !== -1.00)
        {
            inc_rsc = true;
            this.window.style.height = (height * this.#vh_mult).toString() + "px";
        }

        if (inc_rsc) {
            this.#resize_counter++;
        }
        this.#size();
    }

    #extract_digits( unit ) {
        let digits = "";

        unit = unit.toString();

        for ( let i = 0; i < unit.length; i++) {
            if ((unit.charCodeAt(i) >= 48 &&
                unit.charCodeAt(i) <= 57) ||
                unit.charAt(i) === ".")
            {
                digits+=unit.charAt(i);
            }
        }

        if ( isNaN(digits = parseFloat(digits)) ) {
            digits = 0.00;
        }

        return digits;
    }

    /**********************************************************************************************/

    /**
     * 
     * @param {*} params 
     * 
     * Params are an object that has the following attributes:
     * 
     *  url_img         - URL of the image to display without hover or active
     *  url_act         - URL of the image to display when the button is clicked.
     *  url_hov         - URL of the image to display when the button is hovered over.
     *  onclick         - Function to execute when the button is clicked.
     * 
     * 
     */
    add_control_button( params ) {
        let img_disabled    = null;
        let tooltip         = "";
        let enabled         = true;

        /* Check that image params are correct and get them sorted */
        if (!params.hasOwnProperty("url_img") ||
            !params.url_img ||
            typeof params.url_img === 'undefined')
        {
            console.log("WINDOW::add_control_button() - ERROR: There is no \"url_img\" property given, so we don't know what button to draw!");
            params.url_hov = params.url_img;
        }

        if (!params.hasOwnProperty("url_hov") ||
            !params.url_hov ||
            typeof params.url_hov === 'undefined')
        {
            params.url_hov = params.url_img;
        }

        if (!params.hasOwnProperty("url_act") ||
            !params.url_act ||
            typeof params.url_act === 'undefined')
        {
            params.url_act = params.url_hov;
        }

        if (params.hasOwnProperty("url_disabled")) {
            img_disabled = params.url_disabled;
        }

        if (params.hasOwnProperty("tooltip")) {
            tooltip = params.tooltip;
        }

        if (params.hasOwnProperty("enabled")) {
            if (params.enabled === false) {
                enabled = false;
            }
        }

        let ncb = 
            new CONTROL_BUTTON(
                params.url_img,
                params.url_act,
                params.url_hov,
                params.onclick,
                this,
                img_disabled,
                tooltip, 
                enabled);

        this.#size();
        return ncb;
    }



    constructor( x, y, cx, cy, title ) 
    {
        WINDOW.init();
        let wwidth  = window.innerWidth;
        let wheight = window.innerHeight;
        let icx     = 0;
        let icy     = 0;

        this.type                   = 0;
        this.titlecolor_active      = _win_active_color_;
        this.titlecolor_inactive    = _win_inactive_color_;

        this.center_y = false;
        this.center_x = false;

        this.custom_button_list     = [];

        this.restore_position = {
            top:    0,
            left:   0,
            width:  0,
            height: 0,
            x:      0,
            y:      0
        };

        if (typeof cx === 'number') {
            icx = cx;
            cx = cx.toString() + "px";
        }

        if (typeof cy === 'number') {
            icy = cy;
            cy = cy.toString() + "px";
        }

        if (typeof x === 'number') {
            x = x.toString() + "px";
        }

        if (typeof y === 'number') {
            y = y.toString() + "px";
        }


        if ((cx.indexOf("vw") > -1) ||
            cx.substr(-1) === "%")
        {
            this.#vw_width = true;
            this.#vw_mult = (this.#extract_digits(cx) / 100);
            icx = wwidth * this.#vw_mult;
            cx = (icx).toString() + "px";

        }

        if ((cy.indexOf("vh") > -1) ||
            cy.substr(-1) === "%")
        {
            this.#vh_height = true;
            this.#vh_mult = (this.#extract_digits(cy) / 100);
            icy = wheight * this.#vh_mult;
            cy = (icy).toString() + "px";
        }

        if (x === null) {
            x = 0;
            this.center_x = true;
        }

        if (y === null) {
            y = 0 ;
            this.center_y = true;
        }

        // console.log("Windows dimensions: cx: " + cx + "    cy: " + cy);

        this.minimize_information           = {
            info_valid:         false,
            slot:               0,
            min_width:          0,
            min_height:         0,
            ignore_due_to_drag: false,
            row:                0,
            x:                  0,
            y:                  0,
            last_viewport_cx:   0,
            last_viewport_cy:   0
        };

        this.busy_icon_showing              = false;
        this.min_drag_flag                  = false;
        this.buttons_shown                  = "both";
        this.state                          = WINDOW_STATE_NORMAL;
        this.previous_state                 = this.state;
        this.window_being_dragged           = false;
        this.index                          = 0;
        this.id                             = (++WINDOW.#handle_generator);
        this.window                         = document.createElement("div");
        this.window.style.opacity           = 0;
        this.window.style.width             = cx;
        this.window.style.height            = cy;
        this.window.style.left              = this.#calc(x);
        this.window.style.top               = this.#calc(y);
        this.window.style.resize            = "both";
        this.window.style.overflowX         = "hidden";
        this.window.style.overflowY         = "hidden";
        this.window.style.position          = "fixed";
        this.window.style.backgroundColor   = "#d4f9fa";
        this.window.style.color             = "black";
        this.window.style.boxShadow         = "0px 0px 24px 2px " + this.#shadow_color.value;

        this.window.style.border            = "1px solid black";
        this.window.style.zIndex            = 1;
        this.window.id                      = this.id;
        this.window.style.borderRadius      = "10px";

        this.window.onresize                = (e)=>{
            console.log("Resize!");
            this.#size();
        };

        this.window.onscroll                = (e)=>{
            console.log("scroll");
        };

        this.window.classList.add("window");

        this.header_holder                  = document.createElement("div");
        this.header_holder.position         = "absolute";
        this.header_holder.style.left       = "0";
        this.header_holder.style.top        = "0";
        this.header_holder.style.width      = "100%";
        this.header_holder.style.height     = "1.5em";


        this.header                         = document.createElement("table");
        this.header.style.backgroundColor   = _win_active_color_;
        this.header.style.color             = "white";
        this.header.style.textShadow        = "1px 1px 1px black";
        this.header.style.width             = "100%";
        this.header.style.height            = "1.5em";
        this.header.style.borderCollapse    = "collapse";
        this.header.style.verticalAlign 
                                            = "middle";
        this.header.style.borderBottom      = "1px solid black";

        this.header.innerHTML               = _window_tb_html;
        this.header.style.cursor            = "default";

        this.title_bar                      = this.header.querySelector("._window_title_");
        this.title_bar.style.overflow       = "hidden";
        this.title_bar.style.whiteSpace     = "nowrap";
        this.title_bar.style.userSelect     = "none";
        this.title_bar.style.userDrag       = "none";

        this.title_bar_text                 = this.title_bar.querySelector("div._window_ttext_");

        this.title_bar.onmousedown          = (e)=>{
            if ( this.#draggable === true ) {
                this.dragX                  = e.clientX;
                this.dragY                  = e.clientY;
                this.position               = this.window.getBoundingClientRect();
                this.left                   = this.position.left;
                this.top                    = this.position.top;
                this.window_being_dragged   = true;
            }
        };

        this.title_bar_text.style.marginLeft
                                            = "0.25em";

        this.title_bar_text.innerText       = " ";

        this.minimize_button                = this.header.querySelector("._window_min_");
        this.minimize_image_reg             = this.minimize_button.querySelector("img._wm_reg_");
        this.minimize_image_hov             = this.minimize_button.querySelector("img._wm_hov_");
        this.minimize_image_act             = this.minimize_button.querySelector("img._wm_act_");

        this.minimize_image_reg.style.webkitUserDrag = "none";
        this.minimize_image_hov.style.webkitUserDrag = "none";
        this.minimize_image_act.style.webkitUserDrag = "none";

        this.close_button                   = this.header.querySelector("._window_close_");
        this.close_image_reg                = this.close_button.querySelector("img._wc_reg_");
        this.close_image_hov                = this.close_button.querySelector("img._wc_hov_");
        this.close_image_act                = this.close_button.querySelector("img._wc_act_");

        this.close_image_reg.style.webkitUserDrag = "none";
        this.close_image_hov.style.webkitUserDrag = "none";
        this.close_image_act.style.webkitUserDrag = "none";

        this.header_btn_pad                 = this.header.querySelector("._header_btn_pad");

        this.minimize_button.style.width    = "1.5em";
        this.close_button.style.width       = "1.5em";

        /********************   MINIMIZE BUTTON MOUSE/IMAGE LOGIC  ***************************/

        this.minimize_button.onmouseout     = (e)=>{
            this.minimize_image_reg.style.opacity = 1;
            this.minimize_image_hov.style.opacity = 0;
            this.minimize_image_act.style.opacity = 0;
            e.stopPropagation();
            return false;
        };

        this.minimize_button.onmouseup      = (e)=>{
            this.minimize_image_reg.style.opacity = 0;
            this.minimize_image_hov.style.opacity = 1;
            this.minimize_image_act.style.opacity = 0;
            e.stopPropagation();
            return false;
        };

        this.minimize_button.onmousedown    = (e)=>{
            this.minimize_image_reg.style.opacity = 0;
            this.minimize_image_hov.style.opacity = 0;
            this.minimize_image_act.style.opacity = 1;
            e.stopPropagation();
            return false;
        };

        this.minimize_button.onmouseover    = (e)=>{
            if (e.buttons === 1) {
                this.minimize_image_reg.style.opacity = 0;
                this.minimize_image_hov.style.opacity = 0;
                this.minimize_image_act.style.opacity = 1;
            } else {
                this.minimize_image_reg.style.opacity = 0;
                this.minimize_image_hov.style.opacity = 1;
                this.minimize_image_act.style.opacity = 0;
            }
            e.stopPropagation();
            return false;
        };

        this.minimize_button.onclick        = (e)=>{
            WINDOW.set_focus(this);
            this.minimize();
            e.stopPropagation();
            return false;
        };

        /********************   CLOSE BUTTON MOUSE/IMAGE LOGIC  ***************************/
        this.close_button.onmouseout        = (e)=>{
            this.close_image_reg.style.opacity = 1;
            this.close_image_hov.style.opacity = 0;
            this.close_image_act.style.opacity = 0;
            e.stopPropagation();
            return false;
        };

        this.close_button.onmouseup         = (e)=>{
            this.close_image_reg.style.opacity = 0;
            this.close_image_hov.style.opacity = 1;
            this.close_image_act.style.opacity = 0;
            e.stopPropagation();
            return false;
        };

        this.close_button.onmousedown       = (e)=>{
            this.close_image_reg.style.opacity = 0;
            this.close_image_hov.style.opacity = 0;
            this.close_image_act.style.opacity = 1;
            e.stopPropagation();
            return false;
        };

        this.close_button.onmouseover       = (e)=>{
            if (e.buttons === 1) {
                this.close_image_reg.style.opacity = 0;
                this.close_image_hov.style.opacity = 0;
                this.close_image_act.style.opacity = 1;
            } else {
                this.close_image_reg.style.opacity = 0;
                this.close_image_hov.style.opacity = 1;
                this.close_image_act.style.opacity = 0;
            }
            e.stopPropagation();
            return false;
        };

        this.close_button.onclick           = (e)=>{
            this.close();
            WINDOW.set_next_focus();
            e.stopPropagation();
            return false;
        };

        this.window.addEventListener("mousedown", (e)=>{
            if (this.state === WINDOW_STATE_NORMAL ||
                this.get_management_state() === WM_STATE_UNMANAGED)
            {
                WINDOW.set_focus(this);
            }
        });

        this.window.addEventListener("dblclick", (e)=>{
            if (this.state === WINDOW_STATE_MINIMIZED) {
                this.restore();
            }
        });

        this.content_width                   = icx;
        this.content_height                  = icy;

        this.#content                        = document.createElement("div");
        this.#content.style.overflowX        = "hidden";
        this.#content.style.overflowY        = "auto";
        this.#content.style.width            = "100%";
        this.#content.style.position         = "absolute";
        this.#content.classList.add("_window_content_");

        this.svg_containter                  = null;
        this.svg                             = null;
        this.foreign_object                  = null;
        this.#content_size_relative          = false;


        this.#minimized_content                        = document.createElement("div");
        this.#minimized_content.style.overflow         = "hidden";
        this.#minimized_content.style.display          = "none";
        this.#minimized_content.style.width            = "100%";
        this.#minimized_content.style.position         = "absolute";

        this.#content.onscroll               = (e)=>{
            if (this.#onscroll) {
                this.#onscroll(e);
            }
        };

        this.window.appendChild(this.#content);
        this.window.appendChild(this.#minimized_content);


        this.header_holder.appendChild(this.header);
        this.window.appendChild(this.header_holder);
        document.body.appendChild(this.window);

        /* Here, show window transparent and get header measurements */
        this.#control_button_cx             = this.close_button.clientWidth + this.header_btn_pad.clientWidth;

        /* Set title */
        this.icon_image                     = this.header.querySelector("img._wc_icon_img_");
        this.icon_td                        = this.header.querySelector("td._wnd_icon_");
        this.icon_width                     = this.icon_td.clientWidth;

        this.busy_icon                      = this.header.querySelector("img._wc_icon_bsy_");


        this.title_bar_text.innerText       = title;
        this.#size();

        this.#resize_obs = new ResizeObserver((entries)=>{ 
            if (entries.length === 0) return;
            let entry = entries[0];

            if (entry.target === this.window) {
                this.position = entry.contentRect;
                if (this.#resize_counter === 0) {
                    this.#size(true);
                } else {
                    if (--this.#resize_counter <= 0) {
                        this.#resize_counter = 0;
                    }
                }
            } else {
                console.log("Other resize caught.");
            }
        }).observe(this.window);

        WINDOW.add(this);
    }
}

document.addEventListener("DOMContentLoaded", function(){
    WINDOW.init();
});
