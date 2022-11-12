export class ClassName {
    public static NEW_COMMENT: ClassName = new ClassName("new-comment");

    public static RL_ENABLED: ClassName = new ClassName("rolelayer-enabled");
    public static RL_ACTIVE: ClassName = new ClassName("rolelayer-active");

    public static SCANNED: ClassName = new ClassName("rl-scanned");

    public static STYLE_NODE: ClassName = new ClassName("rl-customstyles");

    public static ACTION_MENU_WRAPPER: ClassName = new ClassName("rl-actionmenu");
    public static ACTION_MENU_ROUTER: ClassName = new ClassName("rl-formfinder");

    public static MODAL_WRAPPER: ClassName = new ClassName("rl-modal");

    public static SPRITE_ROOT: ClassName = new ClassName("rl-sprite");
    public static SPRITE_VERTICAL: ClassName = new ClassName("rl-sprite-vertical");
    public static SPRITE_TAB_WRAPPER: ClassName = new ClassName("rl-sprite-wrapper");
    public static SPRITE_TAB_ITEM: ClassName = new ClassName("rl-sprite-tab");
    public static SPRITE_TAB_INPUT: ClassName = new ClassName("rl-sprite-radio");
    public static SPRITE_TAB_LABEL: ClassName = new ClassName("rl-sprite-label");
    public static SPRITE_TAB_ATTR: ClassName = new ClassName("rl-sprite-attr");
    public static SPRITE_TAB_CONTENT: ClassName = new ClassName("rl-sprite-list");

    public static COMMENT_TAGLINE: ClassName = new ClassName("rl-tagline");
    public static COMMENT_CHARACTER_NAME: ClassName = new ClassName("rl-charactername");
    public static COMMENT_LOCALTIME: ClassName = new ClassName("rl-localtime");
    public static COMMENT_SYS_MESSAGE: ClassName = new ClassName("rl-sysmessage");
    public static COMMENT_SHOWDOWN: ClassName = new ClassName("rl-showdown");
    public static COMMENT_COMES_FROM: ClassName = new ClassName("rl-comesfrom");

    public static BUTTON_ROOT: ClassName = new ClassName("rl-button");
    public static BUTTON_FORMAT_LISTENING: ClassName = new ClassName("rl-formatlistening");

    public static IMAGE_SHOWDOWN: ClassName = new ClassName("rl-imgshowdown");

    public static HANDBOOK_ROOT: ClassName = new ClassName("rl-handbook");

    public static DIALOGUE: ClassName = new ClassName("rl-dialogue");
    public static STATEMENT: ClassName = new ClassName("rl-statement");
    public static STATEMENT_SPLIT: ClassName = new ClassName("rl-splitter");
    public static EVIDENCE: ClassName = new ClassName("rl-evidence");

    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    addTo(element: Element) {
        element?.classList?.add(this.name);
    }

    containedIn(element: Element): boolean {
        return element.classList.contains(this.name);
    }

    query(): Element {
        return document.querySelector(`.${this.name}`);
    }

    queryAll(): NodeListOf<Element> {
        return document.querySelectorAll(`.${this.name}`);
    }
}