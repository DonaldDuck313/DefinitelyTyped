/*
Known Problems & Workarounds

1. The type of cloneElement is incorrect.
cloneElement(element, props) should accept props object with a subset of properties on element.props.
React attributes, such as key and ref, should also be accepted in props, but should not exist on element.props.
The "correct" way to model this, then, is with:

declare function cloneElement<P extends Q, Q>(
    element: ReactElement<P>,
    props?: Q & Attributes,
    ...children: ReactNode[]): ReactElement<P>;

However, type inference for Q defaults to {} when intersected with another type.
(https://github.com/Microsoft/TypeScript/pull/5738#issuecomment-181904905)
And since any object is assignable to {}, we would lose the type safety of the P extends Q constraint.
Therefore, the type of props is left as Q, which should work for most cases.
If you need to call cloneElement with key or ref, you'll need a type cast:

interface ButtonProps {
    label: string;
    isDisabled?: boolean;
}
var element: React.CElement<ButtonProps, Button>;

React.cloneElement(element, { label: "label" });

// cloning with optional props requires a cast
React.cloneElement(element, <{ isDisabled?: boolean }>{ isDisabled: true });

// cloning with key or ref requires a cast
React.cloneElement(element, <React.ClassAttributes<Button>>{ ref: button => button.reset() });
React.cloneElement(element, <{ isDisabled?: boolean } & React.Attributes>{
    key: "disabledButton",
    isDisabled: true
});
*/

type NativeAnimationEvent = AnimationEvent;
type NativeClipboardEvent = ClipboardEvent;
type NativeCompositionEvent = CompositionEvent;
type NativeDragEvent = DragEvent;
type NativeFocusEvent = FocusEvent;
type NativeKeyboardEvent = KeyboardEvent;
type NativeMouseEvent = MouseEvent;
type NativeTouchEvent = TouchEvent;
type NativeTransitionEvent = TransitionEvent;
type NativeUIEvent = UIEvent;
type NativeWheelEvent = WheelEvent;
type CrossOrigin = "anonymous" | "use-credentials" | "" | undefined;

// eslint-disable-next-line @definitelytyped/export-just-namespace
export = React;
export as namespace React;

declare namespace React {
    //
    // React Elements
    // ----------------------------------------------------------------------

    type ElementType<P = any> = string | ComponentType<P>;
    /**
     * @deprecated Please use `ElementType`
     */
    type ReactType<P = any> = ElementType<P>;
    type ComponentType<P = {}> = ComponentClass<P> | StatelessComponent<P>;

    type Key = string | number;
    type Ref<T> = string | { bivarianceHack(instance: T | null): any }["bivarianceHack"];

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    type ComponentState = {};

    interface Attributes {
        key?: Key | undefined;
    }
    interface ClassAttributes<T> extends Attributes {
        ref?: Ref<T> | undefined;
    }

    interface ReactElement<P = any> {
        type: string | ComponentClass<P> | SFC<P>;
        props: P;
        key: Key | null;
    }

    interface SFCElement<P> extends ReactElement<P> {
        type: SFC<P>;
    }

    type CElement<P, T extends Component<P, ComponentState>> = ComponentElement<P, T>;
    interface ComponentElement<P, T extends Component<P, ComponentState>> extends ReactElement<P> {
        type: ComponentClass<P>;
        ref?: Ref<T> | undefined;
    }

    type ClassicElement<P> = CElement<P, ClassicComponent<P, ComponentState>>;

    // string fallback for custom web-components
    interface DOMElement<P extends HTMLAttributes<T> | SVGAttributes<T>, T extends Element> extends ReactElement<P> {
        type: string;
        ref: Ref<T>;
    }

    // ReactHTML for ReactHTMLElement
    interface ReactHTMLElement<T extends HTMLElement> extends DetailedReactHTMLElement<AllHTMLAttributes<T>, T> {}

    interface DetailedReactHTMLElement<P extends HTMLAttributes<T>, T extends HTMLElement> extends DOMElement<P, T> {
        type: keyof ReactHTML;
    }

    // ReactSVG for ReactSVGElement
    interface ReactSVGElement extends DOMElement<SVGAttributes<SVGElement>, SVGElement> {
        type: keyof ReactSVG;
    }

    interface WebViewHTMLAttributes<T> extends HTMLAttributes<T> {
        allowFullScreen?: boolean | undefined;
        allowpopups?: boolean | undefined;
        autosize?: boolean | undefined;
        blinkfeatures?: string | undefined;
        disableblinkfeatures?: string | undefined;
        disableguestresize?: boolean | undefined;
        disablewebsecurity?: boolean | undefined;
        guestinstance?: string | undefined;
        httpreferrer?: string | undefined;
        nodeintegration?: boolean | undefined;
        partition?: string | undefined;
        plugins?: boolean | undefined;
        preload?: string | undefined;
        src?: string | undefined;
        useragent?: string | undefined;
        webpreferences?: string | undefined;
    }

    //
    // Factories
    // ----------------------------------------------------------------------

    type Factory<P> = (props?: Attributes & P, ...children: ReactNode[]) => ReactElement<P>;

    type SFCFactory<P> = (props?: Attributes & P, ...children: ReactNode[]) => SFCElement<P>;

    type ComponentFactory<P, T extends Component<P, ComponentState>> = (
        props?: ClassAttributes<T> & P,
        ...children: ReactNode[]
    ) => CElement<P, T>;

    type CFactory<P, T extends Component<P, ComponentState>> = ComponentFactory<P, T>;
    type ClassicFactory<P> = CFactory<P, ClassicComponent<P, ComponentState>>;

    type DOMFactory<P extends DOMAttributes<T>, T extends Element> = (
        props?: ClassAttributes<T> & P | null,
        ...children: ReactNode[]
    ) => DOMElement<P, T>;

    interface HTMLFactory<T extends HTMLElement> extends DetailedHTMLFactory<AllHTMLAttributes<T>, T> {}

    interface DetailedHTMLFactory<P extends HTMLAttributes<T>, T extends HTMLElement> extends DOMFactory<P, T> {
        (props?: ClassAttributes<T> & P | null, ...children: ReactNode[]): DetailedReactHTMLElement<P, T>;
    }

    interface SVGFactory extends DOMFactory<SVGAttributes<SVGElement>, SVGElement> {
        (
            props?: ClassAttributes<SVGElement> & SVGAttributes<SVGElement> | null,
            ...children: ReactNode[]
        ): ReactSVGElement;
    }

    //
    // React Nodes
    // http://facebook.github.io/react/docs/glossary.html
    // ----------------------------------------------------------------------

    type ReactText = string | number;
    type ReactChild = ReactElement | ReactText;

    interface ReactNodeArray extends Array<ReactNode> {}
    type ReactFragment = {} | ReactNodeArray;
    type ReactNode = ReactChild | ReactFragment | boolean | null | undefined;

    //
    // Top Level API
    // ----------------------------------------------------------------------

    function createClass<P, S>(spec: ComponentSpec<P, S>): ClassicComponentClass<P>;

    // DOM Elements
    function createFactory<T extends HTMLElement>(
        type: keyof ReactHTML,
    ): HTMLFactory<T>;
    function createFactory(
        type: keyof ReactSVG,
    ): SVGFactory;
    function createFactory<P extends DOMAttributes<T>, T extends Element>(
        type: string,
    ): DOMFactory<P, T>;

    // Custom components
    function createFactory<P>(type: SFC<P>): SFCFactory<P>;
    function createFactory<P>(
        type: ClassType<P, ClassicComponent<P, ComponentState>, ClassicComponentClass<P>>,
    ): CFactory<P, ClassicComponent<P, ComponentState>>;
    function createFactory<P, T extends Component<P, ComponentState>, C extends ComponentClass<P>>(
        type: ClassType<P, T, C>,
    ): CFactory<P, T>;
    function createFactory<P>(type: ComponentClass<P>): Factory<P>;

    // DOM Elements
    // TODO: generalize this to everything in `keyof ReactHTML`, not just "input"
    function createElement(
        type: "input",
        props?: InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>,
        ...children: ReactNode[]
    ): DetailedReactHTMLElement<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

    function createElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
        type: keyof ReactHTML,
        props?: ClassAttributes<T> & P,
        ...children: ReactNode[]
    ): DetailedReactHTMLElement<P, T>;
    function createElement<P extends SVGAttributes<T>, T extends SVGElement>(
        type: keyof ReactSVG,
        props?: ClassAttributes<T> & P,
        ...children: ReactNode[]
    ): ReactSVGElement;
    function createElement<P extends DOMAttributes<T>, T extends Element>(
        type: string,
        props?: ClassAttributes<T> & P,
        ...children: ReactNode[]
    ): DOMElement<P, T>;

    // Custom components
    function createElement<P>(
        type: SFC<P>,
        props?: Attributes & P,
        ...children: ReactNode[]
    ): SFCElement<P>;
    function createElement<P>(
        type: ClassType<P, ClassicComponent<P, ComponentState>, ClassicComponentClass<P>>,
        props?: ClassAttributes<ClassicComponent<P, ComponentState>> & P,
        ...children: ReactNode[]
    ): CElement<P, ClassicComponent<P, ComponentState>>;
    function createElement<P, T extends Component<P, ComponentState>, C extends ComponentClass<P>>(
        type: ClassType<P, T, C>,
        props?: ClassAttributes<T> & P,
        ...children: ReactNode[]
    ): CElement<P, T>;
    function createElement<P>(
        type: SFC<P> | ComponentClass<P> | string,
        props?: Attributes & P,
        ...children: ReactNode[]
    ): ReactElement<P>;

    // DOM Elements
    // ReactHTMLElement
    function cloneElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
        element: DetailedReactHTMLElement<P, T>,
        props?: P,
        ...children: ReactNode[]
    ): DetailedReactHTMLElement<P, T>;
    // ReactHTMLElement, less specific
    function cloneElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
        element: ReactHTMLElement<T>,
        props?: P,
        ...children: ReactNode[]
    ): ReactHTMLElement<T>;
    // SVGElement
    function cloneElement<P extends SVGAttributes<T>, T extends SVGElement>(
        element: ReactSVGElement,
        props?: P,
        ...children: ReactNode[]
    ): ReactSVGElement;
    // DOM Element (has to be the last, because type checking stops at first overload that fits)
    function cloneElement<P extends DOMAttributes<T>, T extends Element>(
        element: DOMElement<P, T>,
        props?: DOMAttributes<T> & P,
        ...children: ReactNode[]
    ): DOMElement<P, T>;

    // Custom components
    function cloneElement<P extends Q, Q>(
        element: SFCElement<P>,
        props?: Q, // should be Q & Attributes, but then Q is inferred as {}
        ...children: ReactNode[]
    ): SFCElement<P>;
    function cloneElement<P extends Q, Q, T extends Component<P, ComponentState>>(
        element: CElement<P, T>,
        props?: Q, // should be Q & ClassAttributes<T>
        ...children: ReactNode[]
    ): CElement<P, T>;
    function cloneElement<P extends Q, Q>(
        element: ReactElement<P>,
        props?: Q, // should be Q & Attributes
        ...children: ReactNode[]
    ): ReactElement<P>;

    function isValidElement<P>(object: {}): object is ReactElement<P>;

    const DOM: ReactDOM;
    const PropTypes: ReactPropTypes;
    const Children: ReactChildren;
    const version: string;

    //
    // Component API
    // ----------------------------------------------------------------------

    type ReactInstance = Component<any> | Element;

    // Base component for plain JS classes
    interface Component<P = {}, S = {}> extends ComponentLifecycle<P, S> {}
    class Component<P, S> {
        constructor(props?: P, context?: any);

        // We MUST keep setState() as a unified signature because it allows proper checking of the method return type.
        // See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18365#issuecomment-351013257
        // Also, the ` | S` allows intellisense to not be dumbisense
        setState<K extends keyof S>(
            state: ((prevState: Readonly<S>, props: P) => Pick<S, K> | S) | (Pick<S, K> | S),
            callback?: () => any,
        ): void;

        forceUpdate(callBack?: () => any): void;
        render(): JSX.Element | null | false;

        // React.Props<T> is now deprecated, which means that the `children`
        // property is not available on `P` by default, even though you can
        // always pass children as variadic arguments to `createElement`.
        // In the future, if we can define its call signature conditionally
        // on the existence of `children` in `P`, then we should remove this.
        props: Readonly<{ children?: ReactNode | undefined }> & Readonly<P>;
        state: Readonly<S>;
        context: any;
        refs: {
            [key: string]: ReactInstance;
        };
    }

    class PureComponent<P = {}, S = {}> extends Component<P, S> {}

    interface ClassicComponent<P = {}, S = {}> extends Component<P, S> {
        replaceState(nextState: S, callback?: () => any): void;
        isMounted(): boolean;
        getInitialState?(): S;
    }

    interface ChildContextProvider<CC> {
        getChildContext(): CC;
    }

    //
    // Class Interfaces
    // ----------------------------------------------------------------------

    type SFC<P = {}> = StatelessComponent<P>;
    interface StatelessComponent<P = {}> {
        (props: P & { children?: ReactNode | undefined }, context?: any): ReactElement | null;
        propTypes?: ValidationMap<P> | undefined;
        contextTypes?: ValidationMap<any> | undefined;
        defaultProps?: Partial<P> | undefined;
        displayName?: string | undefined;
    }

    interface ComponentClass<P = {}> {
        new(props?: P, context?: any): Component<P, ComponentState>;
        propTypes?: ValidationMap<P> | undefined;
        contextTypes?: ValidationMap<any> | undefined;
        childContextTypes?: ValidationMap<any> | undefined;
        defaultProps?: Partial<P> | undefined;
        displayName?: string | undefined;
    }

    interface ClassicComponentClass<P = {}> extends ComponentClass<P> {
        new(props?: P, context?: any): ClassicComponent<P, ComponentState>;
        getDefaultProps?(): P;
    }

    /**
     * We use an intersection type to infer multiple type parameters from
     * a single argument, which is useful for many top-level API defs.
     * See https://github.com/Microsoft/TypeScript/issues/7234 for more info.
     */
    type ClassType<P, T extends Component<P, ComponentState>, C extends ComponentClass<P>> =
        & C
        & (new(props?: P, context?: any) => T)
        & (new(props?: P, context?: any) => { props: P });

    //
    // Component Specs and Lifecycle
    // ----------------------------------------------------------------------

    interface ComponentLifecycle<P, S> {
        componentWillMount?(): void;
        componentDidMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
        shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
        componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
        componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, prevContext: any): void;
        componentWillUnmount?(): void;
    }

    interface Mixin<P, S> extends ComponentLifecycle<P, S> {
        mixins?: Array<Mixin<P, S>> | undefined;
        statics?: {
            [key: string]: any;
        } | undefined;

        displayName?: string | undefined;
        propTypes?: ValidationMap<any> | undefined;
        contextTypes?: ValidationMap<any> | undefined;
        childContextTypes?: ValidationMap<any> | undefined;

        getDefaultProps?(): P;
        getInitialState?(): S;
    }

    interface ComponentSpec<P, S> extends Mixin<P, S> {
        render(): ReactElement | null;

        [propertyName: string]: any;
    }

    //
    // Event System
    // ----------------------------------------------------------------------

    interface SyntheticEvent<T> {
        bubbles: boolean;
        currentTarget: EventTarget & T;
        cancelable: boolean;
        defaultPrevented: boolean;
        eventPhase: number;
        isTrusted: boolean;
        nativeEvent: Event;
        preventDefault(): void;
        isDefaultPrevented(): boolean;
        stopPropagation(): void;
        isPropagationStopped(): boolean;
        persist(): void;
        // If you thought this should be `EventTarget & T`, see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/12239
        target: EventTarget;
        timeStamp: number;
        type: string;
    }

    interface ClipboardEvent<T> extends SyntheticEvent<T> {
        clipboardData: DataTransfer;
        nativeEvent: NativeClipboardEvent;
    }

    interface CompositionEvent<T> extends SyntheticEvent<T> {
        data: string;
        nativeEvent: NativeCompositionEvent;
    }

    interface DragEvent<T> extends MouseEvent<T> {
        dataTransfer: DataTransfer;
        nativeEvent: NativeDragEvent;
    }

    interface FocusEvent<T> extends SyntheticEvent<T> {
        nativeEvent: NativeFocusEvent;
        relatedTarget: EventTarget;
    }

    interface FormEvent<T> extends SyntheticEvent<T> {
    }

    interface InvalidEvent<T> extends SyntheticEvent<T> {
        target: EventTarget & T;
    }

    interface ChangeEvent<T> extends SyntheticEvent<T> {
        target: EventTarget & T;
    }

    type ModifierKey =
        | "Alt"
        | "AltGraph"
        | "CapsLock"
        | "Control"
        | "Fn"
        | "FnLock"
        | "Hyper"
        | "Meta"
        | "NumLock"
        | "ScrollLock"
        | "Shift"
        | "Super"
        | "Symbol"
        | "SymbolLock";

    interface KeyboardEvent<T> extends SyntheticEvent<T> {
        altKey: boolean;
        charCode: number;
        ctrlKey: boolean;
        getModifierState(key: ModifierKey): boolean;
        key: string;
        keyCode: number;
        locale: string;
        location: number;
        metaKey: boolean;
        nativeEvent: NativeKeyboardEvent;
        repeat: boolean;
        shiftKey: boolean;
        which: number;
    }

    interface MouseEvent<T> extends SyntheticEvent<T> {
        altKey: boolean;
        button: number;
        buttons: number;
        clientX: number;
        clientY: number;
        ctrlKey: boolean;
        getModifierState(key: ModifierKey): boolean;
        metaKey: boolean;
        nativeEvent: NativeMouseEvent;
        pageX: number;
        pageY: number;
        relatedTarget: EventTarget;
        screenX: number;
        screenY: number;
        shiftKey: boolean;
    }

    interface TouchEvent<T> extends SyntheticEvent<T> {
        altKey: boolean;
        changedTouches: TouchList;
        ctrlKey: boolean;
        getModifierState(key: ModifierKey): boolean;
        metaKey: boolean;
        nativeEvent: NativeTouchEvent;
        shiftKey: boolean;
        targetTouches: TouchList;
        touches: TouchList;
    }

    interface UIEvent<T> extends SyntheticEvent<T> {
        detail: number;
        nativeEvent: NativeUIEvent;
        view: AbstractView;
    }

    interface WheelEvent<T> extends MouseEvent<T> {
        deltaMode: number;
        deltaX: number;
        deltaY: number;
        deltaZ: number;
        nativeEvent: NativeWheelEvent;
    }

    interface AnimationEvent<T> extends SyntheticEvent<T> {
        animationName: string;
        elapsedTime: number;
        nativeEvent: NativeAnimationEvent;
        pseudoElement: string;
    }

    interface TransitionEvent<T> extends SyntheticEvent<T> {
        elapsedTime: number;
        nativeEvent: NativeTransitionEvent;
        propertyName: string;
        pseudoElement: string;
    }

    //
    // Event Handler Types
    // ----------------------------------------------------------------------

    type EventHandler<E extends SyntheticEvent<any>> = { bivarianceHack(event: E): void }["bivarianceHack"];

    type ReactEventHandler<T> = EventHandler<SyntheticEvent<T>>;

    type ClipboardEventHandler<T> = EventHandler<ClipboardEvent<T>>;
    type CompositionEventHandler<T> = EventHandler<CompositionEvent<T>>;
    type DragEventHandler<T> = EventHandler<DragEvent<T>>;
    type FocusEventHandler<T> = EventHandler<FocusEvent<T>>;
    type FormEventHandler<T> = EventHandler<FormEvent<T>>;
    type ChangeEventHandler<T> = EventHandler<ChangeEvent<T>>;
    type KeyboardEventHandler<T> = EventHandler<KeyboardEvent<T>>;
    type MouseEventHandler<T> = EventHandler<MouseEvent<T>>;
    type TouchEventHandler<T> = EventHandler<TouchEvent<T>>;
    type UIEventHandler<T> = EventHandler<UIEvent<T>>;
    type WheelEventHandler<T> = EventHandler<WheelEvent<T>>;
    type AnimationEventHandler<T> = EventHandler<AnimationEvent<T>>;
    type TransitionEventHandler<T> = EventHandler<TransitionEvent<T>>;

    //
    // Props / DOM Attributes
    // ----------------------------------------------------------------------

    /**
     * @deprecated This was used to allow clients to pass `ref` and `key`
     * to `createElement`, which is no longer necessary due to intersection
     * types. If you need to declare a props object before passing it to
     * `createElement` or a factory, use `ClassAttributes<T>`:
     *
     * ```ts
     * var b: Button | null;
     * var props: ButtonProps & ClassAttributes<Button> = {
     *     ref: b => button = b, // ok!
     *     label: "I'm a Button"
     * };
     * ```
     */
    interface Props<T> {
        children?: ReactNode | undefined;
        key?: Key | undefined;
        ref?: Ref<T> | undefined;
    }

    interface HTMLProps<T> extends AllHTMLAttributes<T>, ClassAttributes<T> {
    }

    type DetailedHTMLProps<E extends HTMLAttributes<T>, T> = ClassAttributes<T> & E;

    interface SVGProps<T> extends SVGAttributes<T>, ClassAttributes<T> {
    }

    interface SVGLineElementAttributes<T> extends React.SVGProps<T> {}
    interface SVGTextElementAttributes<T> extends React.SVGProps<T> {}

    interface DOMAttributes<T> {
        children?: ReactNode | undefined;
        dangerouslySetInnerHTML?: {
            __html: string;
        } | undefined;

        // Clipboard Events
        onCopy?: ClipboardEventHandler<T> | undefined;
        onCopyCapture?: ClipboardEventHandler<T> | undefined;
        onCut?: ClipboardEventHandler<T> | undefined;
        onCutCapture?: ClipboardEventHandler<T> | undefined;
        onPaste?: ClipboardEventHandler<T> | undefined;
        onPasteCapture?: ClipboardEventHandler<T> | undefined;

        // Composition Events
        onCompositionEnd?: CompositionEventHandler<T> | undefined;
        onCompositionEndCapture?: CompositionEventHandler<T> | undefined;
        onCompositionStart?: CompositionEventHandler<T> | undefined;
        onCompositionStartCapture?: CompositionEventHandler<T> | undefined;
        onCompositionUpdate?: CompositionEventHandler<T> | undefined;
        onCompositionUpdateCapture?: CompositionEventHandler<T> | undefined;

        // Focus Events
        onFocus?: FocusEventHandler<T> | undefined;
        onFocusCapture?: FocusEventHandler<T> | undefined;
        onBlur?: FocusEventHandler<T> | undefined;
        onBlurCapture?: FocusEventHandler<T> | undefined;

        // Form Events
        onChange?: FormEventHandler<T> | undefined;
        onChangeCapture?: FormEventHandler<T> | undefined;
        onInput?: FormEventHandler<T> | undefined;
        onInputCapture?: FormEventHandler<T> | undefined;
        onReset?: FormEventHandler<T> | undefined;
        onResetCapture?: FormEventHandler<T> | undefined;
        onSubmit?: FormEventHandler<T> | undefined;
        onSubmitCapture?: FormEventHandler<T> | undefined;
        onInvalid?: FormEventHandler<T> | undefined;
        onInvalidCapture?: FormEventHandler<T> | undefined;

        // Image Events
        onLoad?: ReactEventHandler<T> | undefined;
        onLoadCapture?: ReactEventHandler<T> | undefined;
        onError?: ReactEventHandler<T> | undefined; // also a Media Event
        onErrorCapture?: ReactEventHandler<T> | undefined; // also a Media Event

        // Keyboard Events
        onKeyDown?: KeyboardEventHandler<T> | undefined;
        onKeyDownCapture?: KeyboardEventHandler<T> | undefined;
        /** @deprecated */
        onKeyPress?: KeyboardEventHandler<T> | undefined;
        /** @deprecated */
        onKeyPressCapture?: KeyboardEventHandler<T> | undefined;
        onKeyUp?: KeyboardEventHandler<T> | undefined;
        onKeyUpCapture?: KeyboardEventHandler<T> | undefined;

        // Media Events
        onAbort?: ReactEventHandler<T> | undefined;
        onAbortCapture?: ReactEventHandler<T> | undefined;
        onCanPlay?: ReactEventHandler<T> | undefined;
        onCanPlayCapture?: ReactEventHandler<T> | undefined;
        onCanPlayThrough?: ReactEventHandler<T> | undefined;
        onCanPlayThroughCapture?: ReactEventHandler<T> | undefined;
        onDurationChange?: ReactEventHandler<T> | undefined;
        onDurationChangeCapture?: ReactEventHandler<T> | undefined;
        onEmptied?: ReactEventHandler<T> | undefined;
        onEmptiedCapture?: ReactEventHandler<T> | undefined;
        onEncrypted?: ReactEventHandler<T> | undefined;
        onEncryptedCapture?: ReactEventHandler<T> | undefined;
        onEnded?: ReactEventHandler<T> | undefined;
        onEndedCapture?: ReactEventHandler<T> | undefined;
        onLoadedData?: ReactEventHandler<T> | undefined;
        onLoadedDataCapture?: ReactEventHandler<T> | undefined;
        onLoadedMetadata?: ReactEventHandler<T> | undefined;
        onLoadedMetadataCapture?: ReactEventHandler<T> | undefined;
        onLoadStart?: ReactEventHandler<T> | undefined;
        onLoadStartCapture?: ReactEventHandler<T> | undefined;
        onPause?: ReactEventHandler<T> | undefined;
        onPauseCapture?: ReactEventHandler<T> | undefined;
        onPlay?: ReactEventHandler<T> | undefined;
        onPlayCapture?: ReactEventHandler<T> | undefined;
        onPlaying?: ReactEventHandler<T> | undefined;
        onPlayingCapture?: ReactEventHandler<T> | undefined;
        onProgress?: ReactEventHandler<T> | undefined;
        onProgressCapture?: ReactEventHandler<T> | undefined;
        onRateChange?: ReactEventHandler<T> | undefined;
        onRateChangeCapture?: ReactEventHandler<T> | undefined;
        onSeeked?: ReactEventHandler<T> | undefined;
        onSeekedCapture?: ReactEventHandler<T> | undefined;
        onSeeking?: ReactEventHandler<T> | undefined;
        onSeekingCapture?: ReactEventHandler<T> | undefined;
        onStalled?: ReactEventHandler<T> | undefined;
        onStalledCapture?: ReactEventHandler<T> | undefined;
        onSuspend?: ReactEventHandler<T> | undefined;
        onSuspendCapture?: ReactEventHandler<T> | undefined;
        onTimeUpdate?: ReactEventHandler<T> | undefined;
        onTimeUpdateCapture?: ReactEventHandler<T> | undefined;
        onVolumeChange?: ReactEventHandler<T> | undefined;
        onVolumeChangeCapture?: ReactEventHandler<T> | undefined;
        onWaiting?: ReactEventHandler<T> | undefined;
        onWaitingCapture?: ReactEventHandler<T> | undefined;

        // MouseEvents
        onClick?: MouseEventHandler<T> | undefined;
        onClickCapture?: MouseEventHandler<T> | undefined;
        onContextMenu?: MouseEventHandler<T> | undefined;
        onContextMenuCapture?: MouseEventHandler<T> | undefined;
        onDoubleClick?: MouseEventHandler<T> | undefined;
        onDoubleClickCapture?: MouseEventHandler<T> | undefined;
        onDrag?: DragEventHandler<T> | undefined;
        onDragCapture?: DragEventHandler<T> | undefined;
        onDragEnd?: DragEventHandler<T> | undefined;
        onDragEndCapture?: DragEventHandler<T> | undefined;
        onDragEnter?: DragEventHandler<T> | undefined;
        onDragEnterCapture?: DragEventHandler<T> | undefined;
        onDragExit?: DragEventHandler<T> | undefined;
        onDragExitCapture?: DragEventHandler<T> | undefined;
        onDragLeave?: DragEventHandler<T> | undefined;
        onDragLeaveCapture?: DragEventHandler<T> | undefined;
        onDragOver?: DragEventHandler<T> | undefined;
        onDragOverCapture?: DragEventHandler<T> | undefined;
        onDragStart?: DragEventHandler<T> | undefined;
        onDragStartCapture?: DragEventHandler<T> | undefined;
        onDrop?: DragEventHandler<T> | undefined;
        onDropCapture?: DragEventHandler<T> | undefined;
        onMouseDown?: MouseEventHandler<T> | undefined;
        onMouseDownCapture?: MouseEventHandler<T> | undefined;
        onMouseEnter?: MouseEventHandler<T> | undefined;
        onMouseLeave?: MouseEventHandler<T> | undefined;
        onMouseMove?: MouseEventHandler<T> | undefined;
        onMouseMoveCapture?: MouseEventHandler<T> | undefined;
        onMouseOut?: MouseEventHandler<T> | undefined;
        onMouseOutCapture?: MouseEventHandler<T> | undefined;
        onMouseOver?: MouseEventHandler<T> | undefined;
        onMouseOverCapture?: MouseEventHandler<T> | undefined;
        onMouseUp?: MouseEventHandler<T> | undefined;
        onMouseUpCapture?: MouseEventHandler<T> | undefined;

        // Selection Events
        onSelect?: ReactEventHandler<T> | undefined;
        onSelectCapture?: ReactEventHandler<T> | undefined;

        // Touch Events
        onTouchCancel?: TouchEventHandler<T> | undefined;
        onTouchCancelCapture?: TouchEventHandler<T> | undefined;
        onTouchEnd?: TouchEventHandler<T> | undefined;
        onTouchEndCapture?: TouchEventHandler<T> | undefined;
        onTouchMove?: TouchEventHandler<T> | undefined;
        onTouchMoveCapture?: TouchEventHandler<T> | undefined;
        onTouchStart?: TouchEventHandler<T> | undefined;
        onTouchStartCapture?: TouchEventHandler<T> | undefined;

        // UI Events
        onScroll?: UIEventHandler<T> | undefined;
        onScrollCapture?: UIEventHandler<T> | undefined;

        // Wheel Events
        onWheel?: WheelEventHandler<T> | undefined;
        onWheelCapture?: WheelEventHandler<T> | undefined;

        // Animation Events
        onAnimationStart?: AnimationEventHandler<T> | undefined;
        onAnimationStartCapture?: AnimationEventHandler<T> | undefined;
        onAnimationEnd?: AnimationEventHandler<T> | undefined;
        onAnimationEndCapture?: AnimationEventHandler<T> | undefined;
        onAnimationIteration?: AnimationEventHandler<T> | undefined;
        onAnimationIterationCapture?: AnimationEventHandler<T> | undefined;

        // Transition Events
        onTransitionEnd?: TransitionEventHandler<T> | undefined;
        onTransitionEndCapture?: TransitionEventHandler<T> | undefined;
    }

    // See CSS 3 CSS-wide keywords https://www.w3.org/TR/css3-values/#common-keywords
    // See CSS 3 Explicit Defaulting https://www.w3.org/TR/css-cascade-3/#defaulting-keywords
    // "all CSS properties can accept these values"
    type CSSWideKeyword = "initial" | "inherit" | "unset";

    // See CSS 3 <percentage> type https://drafts.csswg.org/css-values-3/#percentages
    type CSSPercentage = string;

    // See CSS 3 <length> type https://drafts.csswg.org/css-values-3/#lengths
    type CSSLength = number | string;

    // This interface is not complete. Only properties accepting
    // unitless numbers are listed here (see CSSProperty.js in React)
    interface CSSProperties {
        /**
         * Aligns a flex container's lines within the flex container when there is extra space in the cross-axis, similar to how justify-content aligns individual items within the main-axis.
         */
        alignContent?:
            | CSSWideKeyword
            | "flex-start"
            | "flex-end"
            | "center"
            | "space-between"
            | "space-around"
            | "stretch"
            | undefined;

        /**
         * Sets the default alignment in the cross axis for all of the flex container's items, including anonymous flex items, similarly to how justify-content aligns items along the main axis.
         */
        alignItems?: CSSWideKeyword | "flex-start" | "flex-end" | "center" | "baseline" | "stretch" | undefined;

        /**
         * Allows the default alignment to be overridden for individual flex items.
         */
        alignSelf?: CSSWideKeyword | "auto" | "flex-start" | "flex-end" | "center" | "baseline" | "stretch" | undefined;

        /**
         * This property allows precise alignment of elements, such as graphics,
         * that do not have a baseline-table or lack the desired baseline in their baseline-table.
         * With the alignment-adjust property, the position of the baseline identified by the alignment-baseline
         * can be explicitly determined. It also determines precisely the alignment point for each glyph within a textual element.
         */
        alignmentAdjust?: CSSWideKeyword | any;

        alignmentBaseline?: CSSWideKeyword | any;

        /**
         * Defines a length of time to elapse before an animation starts, allowing an animation to begin execution some time after it is applied.
         */
        animationDelay?: CSSWideKeyword | any;

        /**
         * Defines whether an animation should run in reverse on some or all cycles.
         */
        animationDirection?: CSSWideKeyword | any;

        /**
         * Specifies how many times an animation cycle should play.
         */
        animationIterationCount?: CSSWideKeyword | any;

        /**
         * Defines the list of animations that apply to the element.
         */
        animationName?: CSSWideKeyword | any;

        /**
         * Defines whether an animation is running or paused.
         */
        animationPlayState?: CSSWideKeyword | any;

        /**
         * Allows changing the style of any element to platform-based interface elements or vice versa.
         */
        appearance?: CSSWideKeyword | any;

        /**
         * Determines whether or not the “back” side of a transformed element is visible when facing the viewer.
         */
        backfaceVisibility?: CSSWideKeyword | any;

        /**
         * Shorthand property to set the values for one or more of:
         * background-clip, background-color, background-image,
         * background-origin, background-position, background-repeat,
         * background-size, and background-attachment.
         */
        background?: CSSWideKeyword | any;

        /**
         * If a background-image is specified, this property determines
         * whether that image's position is fixed within the viewport,
         * or scrolls along with its containing block.
         * See CSS 3 background-attachment property https://drafts.csswg.org/css-backgrounds-3/#the-background-attachment
         */
        backgroundAttachment?: CSSWideKeyword | "scroll" | "fixed" | "local" | undefined;

        /**
         * This property describes how the element's background images should blend with each other and the element's background color.
         * The value is a list of blend modes that corresponds to each background image. Each element in the list will apply to the
         * corresponding element of background-image. If a property doesn’t have enough comma-separated values to match the number of layers,
         * the UA must calculate its used value by repeating the list of values until there are enough.
         */
        backgroundBlendMode?: CSSWideKeyword | any;

        /**
         * Sets the background color of an element.
         */
        backgroundColor?: CSSWideKeyword | any;

        backgroundComposite?: CSSWideKeyword | any;

        /**
         * Applies one or more background images to an element. These can be any valid CSS image, including url() paths to image files or CSS gradients.
         */
        backgroundImage?: CSSWideKeyword | any;

        /**
         * Specifies what the background-position property is relative to.
         */
        backgroundOrigin?: CSSWideKeyword | any;

        /**
         * Sets the position of a background image.
         */
        backgroundPosition?: CSSWideKeyword | any;

        /**
         * Background-repeat defines if and how background images will be repeated after they have been sized and positioned
         */
        backgroundRepeat?: CSSWideKeyword | any;

        /**
         * Obsolete - spec retired, not implemented.
         */
        baselineShift?: CSSWideKeyword | any;

        /**
         * Non standard. Sets or retrieves the location of the Dynamic HTML (DHTML) behavior.
         */
        behavior?: CSSWideKeyword | any;

        /**
         * Shorthand property that defines the different properties of all four sides of an element's border in a single declaration.
         * It can be used to set border-width, border-style and border-color, or a subset of these.
         */
        border?: CSSWideKeyword | any;

        /**
         * Shorthand that sets the values of border-bottom-color,
         * border-bottom-style, and border-bottom-width.
         */
        borderBottom?: CSSWideKeyword | any;

        /**
         * Sets the color of the bottom border of an element.
         */
        borderBottomColor?: CSSWideKeyword | any;

        /**
         * Defines the shape of the border of the bottom-left corner.
         */
        borderBottomLeftRadius?: CSSWideKeyword | any;

        /**
         * Defines the shape of the border of the bottom-right corner.
         */
        borderBottomRightRadius?: CSSWideKeyword | any;

        /**
         * Sets the line style of the bottom border of a box.
         */
        borderBottomStyle?: CSSWideKeyword | any;

        /**
         * Sets the width of an element's bottom border. To set all four borders,
         * use the border-width shorthand property which sets the values simultaneously for border-top-width,
         * border-right-width, border-bottom-width, and border-left-width.
         */
        borderBottomWidth?: CSSWideKeyword | any;

        /**
         * Border-collapse can be used for collapsing the borders between table cells
         */
        borderCollapse?: CSSWideKeyword | any;

        /**
         * The CSS border-color property sets the color of an element's four borders.
         * This property can have from one to four values, made up of the elementary properties:
         *      •       border-top-color
         *      •       border-right-color
         *      •       border-bottom-color
         *      •       border-left-color The default color is the currentColor of each of these values.
         * If you provide one value, it sets the color for the element. Two values set the horizontal and vertical values,
         * respectively. Providing three values sets the top, vertical, and bottom values, in that order.
         * Four values set all for sides: top, right, bottom, and left, in that order.
         */
        borderColor?: CSSWideKeyword | any;

        /**
         * Specifies different corner clipping effects, such as scoop (inner curves), bevel (straight cuts) or notch (cut-off rectangles).
         * Works along with border-radius to specify the size of each corner effect.
         */
        borderCornerShape?: CSSWideKeyword | any;

        /**
         * The property border-image-source is used to set the image to be used instead of the border style.
         * If this is set to none the border-style is used instead.
         */
        borderImageSource?: CSSWideKeyword | any;

        /**
         * The border-image-width CSS property defines the offset to use for dividing the border image in nine parts,
         * the top-left corner, central top edge, top-right-corner, central right edge, bottom-right corner, central bottom edge,
         * bottom-left corner, and central right edge. They represent inward distance from the top, right, bottom, and left edges.
         */
        borderImageWidth?: CSSWideKeyword | any;

        /**
         * Shorthand property that defines the border-width, border-style and border-color of an element's left border in a single declaration.
         * Note that you can use the corresponding longhand properties to set specific individual properties of the left border — border-left-width,
         * border-left-style and border-left-color.
         */
        borderLeft?: CSSWideKeyword | any;

        /**
         * The CSS border-left-color property sets the color of an element's left border. This page explains the border-left-color value,
         * but often you will find it more convenient to fix the border's left color as part of a shorthand set, either border-left or border-color.
         * Colors can be defined several ways. For more information, see Usage.
         */
        borderLeftColor?: CSSWideKeyword | any;

        /**
         * Sets the style of an element's left border. To set all four borders, use the shorthand property, border-style.
         * Otherwise, you can set the borders individually with border-top-style, border-right-style, border-bottom-style, border-left-style.
         */
        borderLeftStyle?: CSSWideKeyword | any;

        /**
         * Sets the width of an element's left border. To set all four borders,
         * use the border-width shorthand property which sets the values simultaneously for border-top-width,
         * border-right-width, border-bottom-width, and border-left-width.
         */
        borderLeftWidth?: CSSWideKeyword | any;

        /**
         * Shorthand property that defines the border-width, border-style and border-color of an element's right border
         * in a single declaration. Note that you can use the corresponding longhand properties to set specific
         * individual properties of the right border — border-right-width, border-right-style and border-right-color.
         */
        borderRight?: CSSWideKeyword | any;

        /**
         * Sets the color of an element's right border. This page explains the border-right-color value,
         * but often you will find it more convenient to fix the border's right color as part of a shorthand set,
         * either border-right or border-color.
         * Colors can be defined several ways. For more information, see Usage.
         */
        borderRightColor?: CSSWideKeyword | any;

        /**
         * Sets the style of an element's right border. To set all four borders, use the shorthand property,
         * border-style. Otherwise, you can set the borders individually with border-top-style, border-right-style,
         * border-bottom-style, border-left-style.
         */
        borderRightStyle?: CSSWideKeyword | any;

        /**
         * Sets the width of an element's right border. To set all four borders,
         * use the border-width shorthand property which sets the values simultaneously for border-top-width,
         * border-right-width, border-bottom-width, and border-left-width.
         */
        borderRightWidth?: CSSWideKeyword | any;

        /**
         * Specifies the distance between the borders of adjacent cells.
         */
        borderSpacing?: CSSWideKeyword | any;

        /**
         * Sets the style of an element's four borders. This property can have from one to four values.
         * With only one value, the value will be applied to all four borders;
         * otherwise, this works as a shorthand property for each of border-top-style, border-right-style,
         * border-bottom-style, border-left-style, where each border style may be assigned a separate value.
         */
        borderStyle?: CSSWideKeyword | any;

        /**
         * Shorthand property that defines the border-width, border-style and border-color of an element's top border
         * in a single declaration. Note that you can use the corresponding longhand properties to set specific
         * individual properties of the top border — border-top-width, border-top-style and border-top-color.
         */
        borderTop?: CSSWideKeyword | any;

        /**
         * Sets the color of an element's top border. This page explains the border-top-color value,
         * but often you will find it more convenient to fix the border's top color as part of a shorthand set,
         * either border-top or border-color.
         * Colors can be defined several ways. For more information, see Usage.
         */
        borderTopColor?: CSSWideKeyword | any;

        /**
         * Sets the rounding of the top-left corner of the element.
         */
        borderTopLeftRadius?: CSSWideKeyword | any;

        /**
         * Sets the rounding of the top-right corner of the element.
         */
        borderTopRightRadius?: CSSWideKeyword | any;

        /**
         * Sets the style of an element's top border. To set all four borders, use the shorthand property, border-style.
         * Otherwise, you can set the borders individually with border-top-style, border-right-style, border-bottom-style, border-left-style.
         */
        borderTopStyle?: CSSWideKeyword | any;

        /**
         * Sets the width of an element's top border. To set all four borders,
         * use the border-width shorthand property which sets the values simultaneously for border-top-width,
         * border-right-width, border-bottom-width, and border-left-width.
         */
        borderTopWidth?: CSSWideKeyword | any;

        /**
         * Sets the width of an element's four borders. This property can have from one to four values.
         * This is a shorthand property for setting values simultaneously for border-top-width,
         * border-right-width, border-bottom-width, and border-left-width.
         */
        borderWidth?: CSSWideKeyword | any;

        /**
         * This property specifies how far an absolutely positioned box's bottom margin edge
         * is offset above the bottom edge of the box's containing block. For relatively positioned boxes,
         * the offset is with respect to the bottom edges of the box itself
         * (i.e., the box is given a position in the normal flow, then offset from that position according to these properties).
         */
        bottom?: CSSWideKeyword | any;

        /**
         * Obsolete.
         */
        boxAlign?: CSSWideKeyword | any;

        /**
         * Breaks a box into fragments creating new borders,
         * padding and repeating backgrounds or lets it stay as a continuous box on a page break,
         * column break, or, for inline elements, at a line break.
         */
        boxDecorationBreak?: CSSWideKeyword | any;

        /**
         * Deprecated
         */
        boxDirection?: CSSWideKeyword | any;

        /**
         * Do not use. This property has been replaced by the flex-wrap property.
         * Gets or sets a value that specifies the direction to add successive rows or columns when the value of box-lines is set to multiple.
         */
        boxLineProgression?: CSSWideKeyword | any;

        /**
         * Do not use. This property has been replaced by the flex-wrap property.
         * Gets or sets a value that specifies whether child elements wrap onto multiple lines or columns based on the space available in the object.
         */
        boxLines?: CSSWideKeyword | any;

        /**
         * Do not use. This property has been replaced by flex-order.
         * Specifies the ordinal group that a child element of the object belongs to.
         * This ordinal value identifies the display order (along the axis defined by the box-orient property) for the group.
         */
        boxOrdinalGroup?: CSSWideKeyword | any;

        /**
         * Deprecated.
         */
        boxFlex?: CSSWideKeyword | number | undefined;

        /**
         * Deprecated.
         */
        boxFlexGroup?: CSSWideKeyword | number | undefined;

        /**
         * Cast a drop shadow from the frame of almost any element.
         * MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
         */
        boxShadow?: CSSWideKeyword | any;

        /**
         * The CSS break-after property allows you to force a break on multi-column layouts.
         * More specifically, it allows you to force a break after an element.
         * It allows you to determine if a break should occur, and what type of break it should be.
         * The break-after CSS property describes how the page, column or region break behaves after the generated box.
         * If there is no generated box, the property is ignored.
         */
        breakAfter?: CSSWideKeyword | any;

        /**
         * Control page/column/region breaks that fall above a block of content
         */
        breakBefore?: CSSWideKeyword | any;

        /**
         * Control page/column/region breaks that fall within a block of content
         */
        breakInside?: CSSWideKeyword | any;

        /**
         * The clear CSS property specifies if an element can be positioned next to
         * or must be positioned below the floating elements that precede it in the markup.
         */
        clear?: CSSWideKeyword | any;

        /**
         * Deprecated; see clip-path.
         * Lets you specify the dimensions of an absolutely positioned element that should be visible,
         * and the element is clipped into this shape, and displayed.
         */
        clip?: CSSWideKeyword | any;

        /**
         * Clipping crops an graphic, so that only a portion of the graphic is rendered, or filled.
         * This clip-rule property, when used with the clip-path property, defines which clip rule, or algorithm,
         * to use when filling the different parts of a graphics.
         */
        clipRule?: CSSWideKeyword | any;

        /**
         * The color property sets the color of an element's foreground content (usually text),
         * accepting any standard CSS color from keywords and hex values to RGB(a) and HSL(a).
         */
        color?: CSSWideKeyword | any;

        /**
         * Describes the number of columns of the element.
         * See CSS 3 column-count property https://www.w3.org/TR/css3-multicol/#cc
         */
        columnCount?: CSSWideKeyword | number | "auto" | undefined;

        /**
         * Specifies how to fill columns (balanced or sequential).
         */
        columnFill?: CSSWideKeyword | any;

        /**
         * The column-gap property controls the width of the gap between columns in multi-column elements.
         */
        columnGap?: CSSWideKeyword | any;

        /**
         * Sets the width, style, and color of the rule between columns.
         */
        columnRule?: CSSWideKeyword | any;

        /**
         * Specifies the color of the rule between columns.
         */
        columnRuleColor?: CSSWideKeyword | any;

        /**
         * Specifies the width of the rule between columns.
         */
        columnRuleWidth?: CSSWideKeyword | any;

        /**
         * The column-span CSS property makes it possible for an element to span across all columns when its value is set to all.
         * An element that spans more than one column is called a spanning element.
         */
        columnSpan?: CSSWideKeyword | any;

        /**
         * Specifies the width of columns in multi-column elements.
         */
        columnWidth?: CSSWideKeyword | any;

        /**
         * This property is a shorthand property for setting column-width and/or column-count.
         */
        columns?: CSSWideKeyword | any;

        /**
         * The counter-increment property accepts one or more names of counters (identifiers),
         * each one optionally followed by an integer which specifies the value by which the counter should be incremented
         * (e.g. if the value is 2, the counter increases by 2 each time it is invoked).
         */
        counterIncrement?: CSSWideKeyword | any;

        /**
         * The counter-reset property contains a list of one or more names of counters,
         * each one optionally followed by an integer (otherwise, the integer defaults to 0.).
         * Each time the given element is invoked, the counters specified by the property are set to the given integer.
         */
        counterReset?: CSSWideKeyword | any;

        /**
         * The cue property specifies sound files (known as an "auditory icon") to be played by speech media agents
         * before and after presenting an element's content; if only one file is specified, it is played both before and after.
         * The volume at which the file(s) should be played, relative to the volume of the main element, may also be specified.
         * The icon files may also be set separately with the cue-before and cue-after properties.
         */
        cue?: CSSWideKeyword | any;

        /**
         * The cue-after property specifies a sound file (known as an "auditory icon") to be played by speech media agents
         * after presenting an element's content; the volume at which the file should be played may also be specified.
         * The shorthand property cue sets cue sounds for both before and after the element is presented.
         */
        cueAfter?: CSSWideKeyword | any;

        /**
         * Specifies the mouse cursor displayed when the mouse pointer is over an element.
         */
        cursor?: CSSWideKeyword | any;

        /**
         * The direction CSS property specifies the text direction/writing direction. The rtl is used for Hebrew or Arabic text, the ltr is for other languages.
         */
        direction?: CSSWideKeyword | any;

        /**
         * This property specifies the type of rendering box used for an element. It is a shorthand property for many other display properties.
         */
        display?: CSSWideKeyword | any;

        /**
         * The ‘fill’ property paints the interior of the given graphical element.
         * The area to be painted consists of any areas inside the outline of the shape.
         * To determine the inside of the shape, all subpaths are considered,
         * and the interior is determined according to the rules associated with the current value of the ‘fill-rule’ property.
         * The zero-width geometric outline of a shape is included in the area to be painted.
         */
        fill?: CSSWideKeyword | any;

        /**
         * SVG: Specifies the opacity of the color or the content the current object is filled with.
         * See SVG 1.1 https://www.w3.org/TR/SVG/painting.html#FillOpacityProperty
         */
        fillOpacity?: CSSWideKeyword | number | undefined;

        /**
         * The ‘fill-rule’ property indicates the algorithm which is to be used to determine what parts of the canvas are included inside the shape.
         * For a simple, non-intersecting path, it is intuitively clear what region lies "inside";
         * however, for a more complex path, such as a path that intersects itself or where one subpath encloses another,
         * the interpretation of "inside" is not so obvious.
         * The ‘fill-rule’ property provides two options for how the inside of a shape is determined:
         */
        fillRule?: CSSWideKeyword | any;

        /**
         * Applies various image processing effects. This property is largely unsupported. See Compatibility section for more information.
         */
        filter?: CSSWideKeyword | any;

        /**
         * Shorthand for `flex-grow`, `flex-shrink`, and `flex-basis`.
         */
        flex?: CSSWideKeyword | number | string | undefined;

        /**
         * Obsolete, do not use. This property has been renamed to align-items.
         * Specifies the alignment (perpendicular to the layout axis defined by the flex-direction property) of child elements of the object.
         */
        flexAlign?: CSSWideKeyword | any;

        /**
         * The flex-basis CSS property describes the initial main size of the flex item
         * before any free space is distributed according to the flex factors described in the flex property (flex-grow and flex-shrink).
         */
        flexBasis?: CSSWideKeyword | any;

        /**
         * The flex-direction CSS property describes how flex items are placed in the flex container, by setting the direction of the flex container's main axis.
         */
        flexDirection?: CSSWideKeyword | "row" | "row-reverse" | "column" | "column-reverse" | undefined;

        /**
         * The flex-flow CSS property defines the flex container's main and cross axis. It is a shorthand property for the flex-direction and flex-wrap properties.
         */
        flexFlow?: CSSWideKeyword | string | undefined;

        /**
         * Specifies the flex grow factor of a flex item.
         * See CSS flex-grow property https://drafts.csswg.org/css-flexbox-1/#flex-grow-property
         */
        flexGrow?: CSSWideKeyword | number | undefined;

        /**
         * Do not use. This property has been renamed to align-self
         * Specifies the alignment (perpendicular to the layout axis defined by flex-direction) of child elements of the object.
         */
        flexItemAlign?: CSSWideKeyword | any;

        /**
         * Do not use. This property has been renamed to align-content.
         * Specifies how a flexbox's lines align within the flexbox when there is extra space along the axis that is perpendicular to the axis defined by the flex-direction property.
         */
        flexLinePack?: CSSWideKeyword | any;

        /**
         * Gets or sets a value that specifies the ordinal group that a flexbox element belongs to. This ordinal value identifies the display order for the group.
         */
        flexOrder?: CSSWideKeyword | any;

        /**
         * Specifies the flex shrink factor of a flex item.
         * See CSS flex-shrink property https://drafts.csswg.org/css-flexbox-1/#flex-shrink-property
         */
        flexShrink?: CSSWideKeyword | number | undefined;

        /**
         * Specifies whether flex items are forced into a single line or can be wrapped onto multiple lines.
         * If wrapping is allowed, this property also enables you to control the direction in which lines are stacked.
         * See CSS flex-wrap property https://drafts.csswg.org/css-flexbox-1/#flex-wrap-property
         */
        flexWrap?: CSSWideKeyword | "nowrap" | "wrap" | "wrap-reverse" | undefined;

        /**
         * Elements which have the style float are floated horizontally.
         * These elements can move as far to the left or right of the containing element.
         * All elements after the floating element will flow around it, but elements before the floating element are not impacted.
         * If several floating elements are placed after each other, they will float next to each other as long as there is room.
         */
        float?: CSSWideKeyword | any;

        /**
         * Flows content from a named flow (specified by a corresponding flow-into) through selected elements to form a dynamic chain of layout regions.
         */
        flowFrom?: CSSWideKeyword | any;

        /**
         * The font property is shorthand that allows you to do one of two things: you can either set up six of the most mature font properties in one line,
         * or you can set one of a choice of keywords to adopt a system font setting.
         */
        font?: CSSWideKeyword | any;

        /**
         * The font-family property allows one or more font family names and/or generic family names to be specified for usage on the selected element(s)' text.
         * The browser then goes through the list; for each character in the selection it applies the first font family that has an available glyph for that character.
         */
        fontFamily?: CSSWideKeyword | any;

        /**
         * The font-kerning property allows contextual adjustment of inter-glyph spacing, i.e. the spaces between the characters in text.
         * This property controls <bold>metric kerning</bold> - that utilizes adjustment data contained in the font. Optical Kerning is not supported as yet.
         */
        fontKerning?: CSSWideKeyword | any;

        /**
         * Specifies the size of the font. Used to compute em and ex units.
         * See CSS 3 font-size property https://www.w3.org/TR/css-fonts-3/#propdef-font-size
         */
        fontSize?:
            | CSSWideKeyword
            | "xx-small"
            | "x-small"
            | "small"
            | "medium"
            | "large"
            | "x-large"
            | "xx-large"
            | "larger"
            | "smaller"
            | CSSLength
            | CSSPercentage
            | undefined;

        /**
         * The font-size-adjust property adjusts the font-size of the fallback fonts defined with font-family,
         * so that the x-height is the same no matter what font is used.
         * This preserves the readability of the text when fallback happens.
         * See CSS 3 font-size-adjust property https://www.w3.org/TR/css-fonts-3/#propdef-font-size-adjust
         */
        fontSizeAdjust?: CSSWideKeyword | "none" | number | undefined;

        /**
         * Allows you to expand or condense the widths for a normal, condensed, or expanded font face.
         * See CSS 3 font-stretch property https://drafts.csswg.org/css-fonts-3/#propdef-font-stretch
         */
        fontStretch?:
            | CSSWideKeyword
            | "normal"
            | "ultra-condensed"
            | "extra-condensed"
            | "condensed"
            | "semi-condensed"
            | "semi-expanded"
            | "expanded"
            | "extra-expanded"
            | "ultra-expanded"
            | undefined;

        /**
         * The font-style property allows normal, italic, or oblique faces to be selected.
         * Italic forms are generally cursive in nature while oblique faces are typically sloped versions of the regular face.
         * Oblique faces can be simulated by artificially sloping the glyphs of the regular face.
         * See CSS 3 font-style property https://www.w3.org/TR/css-fonts-3/#propdef-font-style
         */
        fontStyle?: CSSWideKeyword | "normal" | "italic" | "oblique" | undefined;

        /**
         * This value specifies whether the user agent is allowed to synthesize bold or oblique font faces when a font family lacks bold or italic faces.
         */
        fontSynthesis?: CSSWideKeyword | any;

        /**
         * The font-variant property enables you to select the small-caps font within a font family.
         */
        fontVariant?: CSSWideKeyword | any;

        /**
         * Fonts can provide alternate glyphs in addition to default glyph for a character. This property provides control over the selection of these alternate glyphs.
         */
        fontVariantAlternates?: CSSWideKeyword | any;

        /**
         * Specifies the weight or boldness of the font.
         * See CSS 3 'font-weight' property https://www.w3.org/TR/css-fonts-3/#propdef-font-weight
         */
        fontWeight?:
            | CSSWideKeyword
            | "normal"
            | "bold"
            | "bolder"
            | "lighter"
            | 100
            | 200
            | 300
            | 400
            | 500
            | 600
            | 700
            | 800
            | 900
            | undefined;

        /**
         * Lays out one or more grid items bound by 4 grid lines. Shorthand for setting grid-column-start, grid-column-end, grid-row-start, and grid-row-end in a single declaration.
         */
        gridArea?: CSSWideKeyword | any;

        /**
         * Controls a grid item's placement in a grid area, particularly grid position and a grid span. Shorthand for setting grid-column-start and grid-column-end in a single declaration.
         */
        gridColumn?: CSSWideKeyword | any;

        /**
         * Controls a grid item's placement in a grid area as well as grid position and a grid span.
         * The grid-column-end property (with grid-row-start, grid-row-end, and grid-column-start) determines a grid item's placement by specifying the grid lines of a grid item's grid area.
         */
        gridColumnEnd?: CSSWideKeyword | any;

        /**
         * Determines a grid item's placement by specifying the starting grid lines of a grid item's grid area.
         * A grid item's placement in a grid area consists of a grid position and a grid span.
         * See also ( grid-row-start, grid-row-end, and grid-column-end)
         */
        gridColumnStart?: CSSWideKeyword | any;

        /**
         * Gets or sets a value that indicates which row an element within a Grid should appear in. Shorthand for setting grid-row-start and grid-row-end in a single declaration.
         */
        gridRow?: CSSWideKeyword | any;

        /**
         * Determines a grid item’s placement by specifying the block-end. A grid item's placement in a grid area consists of a grid position and a grid span.
         * The grid-row-end property (with grid-row-start, grid-column-start, and grid-column-end) determines a grid item's placement by specifying the grid lines of a grid item's grid area.
         */
        gridRowEnd?: CSSWideKeyword | any;

        /**
         * Specifies a row position based upon an integer location, string value, or desired row size.
         * css/properties/grid-row is used as short-hand for grid-row-position and grid-row-position
         */
        gridRowPosition?: CSSWideKeyword | any;

        gridRowSpan?: CSSWideKeyword | any;

        /**
         * Specifies named grid areas which are not associated with any particular grid item, but can be referenced from the grid-placement properties.
         * The syntax of the grid-template-areas property also provides a visualization of the structure of the grid, making the overall layout of the grid container easier to understand.
         */
        gridTemplateAreas?: CSSWideKeyword | any;

        /**
         * Specifies (with grid-template-rows) the line names and track sizing functions of the grid.
         * Each sizing function can be specified as a length, a percentage of the grid container’s size,
         * a measurement of the contents occupying the column or row, or a fraction of the free space in the grid.
         */
        gridTemplateColumns?: CSSWideKeyword | any;

        /**
         * Specifies (with grid-template-columns) the line names and track sizing functions of the grid.
         * Each sizing function can be specified as a length, a percentage of the grid container’s size,
         * a measurement of the contents occupying the column or row, or a fraction of the free space in the grid.
         */
        gridTemplateRows?: CSSWideKeyword | any;

        /**
         * Sets the height of an element. The content area of the element height does not include the padding, border, and margin of the element.
         */
        height?: CSSWideKeyword | any;

        /**
         * Specifies the minimum number of characters in a hyphenated word
         */
        hyphenateLimitChars?: CSSWideKeyword | any;

        /**
         * Indicates the maximum number of successive hyphenated lines in an element. The ‘no-limit’ value means that there is no limit.
         */
        hyphenateLimitLines?: CSSWideKeyword | any;

        /**
         * Specifies the maximum amount of trailing whitespace (before justification) that may be left in a line before hyphenation is triggered
         * to pull part of a word from the next line back up into the current one.
         */
        hyphenateLimitZone?: CSSWideKeyword | any;

        /**
         * Specifies whether or not words in a sentence can be split by the use of a manual or automatic hyphenation mechanism.
         */
        hyphens?: CSSWideKeyword | any;

        imeMode?: CSSWideKeyword | any;

        /**
         * Defines how the browser distributes space between and around flex items
         * along the main-axis of their container.
         * See CSS justify-content property https://www.w3.org/TR/css-flexbox-1/#justify-content-property
         */
        justifyContent?:
            | CSSWideKeyword
            | "flex-start"
            | "flex-end"
            | "center"
            | "space-between"
            | "space-around"
            | "space-evenly"
            | undefined;

        layoutGrid?: CSSWideKeyword | any;

        layoutGridChar?: CSSWideKeyword | any;

        layoutGridLine?: CSSWideKeyword | any;

        layoutGridMode?: CSSWideKeyword | any;

        layoutGridType?: CSSWideKeyword | any;

        /**
         * Sets the left edge of an element
         */
        left?: CSSWideKeyword | any;

        /**
         * The letter-spacing CSS property specifies the spacing behavior between text characters.
         */
        letterSpacing?: CSSWideKeyword | any;

        /**
         * Deprecated. Gets or sets line-breaking rules for text in selected languages such as Japanese, Chinese, and Korean.
         */
        lineBreak?: CSSWideKeyword | any;

        lineClamp?: CSSWideKeyword | number | undefined;

        /**
         * Specifies the height of an inline block level element.
         * See CSS 2.1 line-height property https://www.w3.org/TR/CSS21/visudet.html#propdef-line-height
         */
        lineHeight?: CSSWideKeyword | "normal" | number | CSSLength | CSSPercentage | undefined;

        /**
         * Shorthand property that sets the list-style-type, list-style-position and list-style-image properties in one declaration.
         */
        listStyle?: CSSWideKeyword | any;

        /**
         * This property sets the image that will be used as the list item marker. When the image is available,
         * it will replace the marker set with the 'list-style-type' marker. That also means that if the image is not available,
         * it will show the style specified by list-style-property
         */
        listStyleImage?: CSSWideKeyword | any;

        /**
         * Specifies if the list-item markers should appear inside or outside the content flow.
         */
        listStylePosition?: CSSWideKeyword | any;

        /**
         * Specifies the type of list-item marker in a list.
         */
        listStyleType?: CSSWideKeyword | any;

        /**
         * The margin property is shorthand to allow you to set all four margins of an element at once.
         * Its equivalent longhand properties are margin-top, margin-right, margin-bottom and margin-left.
         * Negative values are also allowed.
         */
        margin?: CSSWideKeyword | any;

        /**
         * margin-bottom sets the bottom margin of an element.
         */
        marginBottom?: CSSWideKeyword | any;

        /**
         * margin-left sets the left margin of an element.
         */
        marginLeft?: CSSWideKeyword | any;

        /**
         * margin-right sets the right margin of an element.
         */
        marginRight?: CSSWideKeyword | any;

        /**
         * margin-top sets the top margin of an element.
         */
        marginTop?: CSSWideKeyword | any;

        /**
         * The marquee-direction determines the initial direction in which the marquee content moves.
         */
        marqueeDirection?: CSSWideKeyword | any;

        /**
         * The 'marquee-style' property determines a marquee's scrolling behavior.
         */
        marqueeStyle?: CSSWideKeyword | any;

        /**
         * This property is shorthand for setting mask-image, mask-mode, mask-repeat, mask-position, mask-clip, mask-origin, mask-composite and mask-size.
         * Omitted values are set to their original properties' initial values.
         */
        mask?: CSSWideKeyword | any;

        /**
         * This property is shorthand for setting mask-border-source, mask-border-slice, mask-border-width, mask-border-outset, and mask-border-repeat.
         * Omitted values are set to their original properties' initial values.
         */
        maskBorder?: CSSWideKeyword | any;

        /**
         * This property specifies how the images for the sides and the middle part of the mask image are scaled and tiled.
         * The first keyword applies to the horizontal sides, the second one applies to the vertical ones.
         * If the second keyword is absent, it is assumed to be the same as the first, similar to the CSS border-image-repeat property.
         */
        maskBorderRepeat?: CSSWideKeyword | any;

        /**
         * This property specifies inward offsets from the top, right, bottom, and left edges of the mask image,
         * dividing it into nine regions: four corners, four edges, and a middle.
         * The middle image part is discarded and treated as fully transparent black unless the fill keyword is present.
         * The four values set the top, right, bottom and left offsets in that order, similar to the CSS border-image-slice property.
         */
        maskBorderSlice?: CSSWideKeyword | any;

        /**
         * Specifies an image to be used as a mask. An image that is empty, fails to download, is non-existent, or cannot be displayed is ignored and does not mask the element.
         */
        maskBorderSource?: CSSWideKeyword | any;

        /**
         * This property sets the width of the mask box image, similar to the CSS border-image-width property.
         */
        maskBorderWidth?: CSSWideKeyword | any;

        /**
         * Determines the mask painting area, which defines the area that is affected by the mask.
         * The painted content of an element may be restricted to this area.
         */
        maskClip?: CSSWideKeyword | any;

        /**
         * For elements rendered as a single box, specifies the mask positioning area.
         * For elements rendered as multiple boxes (e.g., inline boxes on several lines, boxes on several pages)
         * specifies which boxes box-decoration-break operates on to determine the mask positioning area(s).
         */
        maskOrigin?: CSSWideKeyword | any;

        /**
         * This property must not be used. It is no longer included in any standard or standard track specification,
         * nor is it implemented in any browser. It is only used when the text-align-last property is set to size.
         * It controls allowed adjustments of font-size to fit line content.
         */
        maxFontSize?: CSSWideKeyword | any;

        /**
         * Sets the maximum height for an element. It prevents the height of the element to exceed the specified value.
         * If min-height is specified and is greater than max-height, max-height is overridden.
         */
        maxHeight?: CSSWideKeyword | any;

        /**
         * Sets the maximum width for an element. It limits the width property to be larger than the value specified in max-width.
         */
        maxWidth?: CSSWideKeyword | any;

        /**
         * Sets the minimum height for an element. It prevents the height of the element to be smaller than the specified value.
         * The value of min-height overrides both max-height and height.
         */
        minHeight?: CSSWideKeyword | any;

        /**
         * Sets the minimum width of an element. It limits the width property to be not smaller than the value specified in min-width.
         */
        minWidth?: CSSWideKeyword | any;

        /**
         * Specifies the transparency of an element.
         * See CSS 3 opacity property https://drafts.csswg.org/css-color-3/#opacity
         */
        opacity?: CSSWideKeyword | number | undefined;

        /**
         * Specifies the order used to lay out flex items in their flex container.
         * Elements are laid out in the ascending order of the order value.
         * See CSS order property https://drafts.csswg.org/css-flexbox-1/#order-property
         */
        order?: CSSWideKeyword | number | undefined;

        /**
         * In paged media, this property defines the minimum number of lines in
         * a block container that must be left at the bottom of the page.
         * See CSS 3 orphans, widows properties https://drafts.csswg.org/css-break-3/#widows-orphans
         */
        orphans?: CSSWideKeyword | number | undefined;

        /**
         * The CSS outline property is a shorthand property for setting one or more of the individual outline properties outline-style,
         * outline-width and outline-color in a single rule. In most cases the use of this shortcut is preferable and more convenient.
         * Outlines differ from borders in the following ways:
         *      •       Outlines do not take up space, they are drawn above the content.
         *      •       Outlines may be non-rectangular. They are rectangular in Gecko/Firefox.
         *              Internet Explorer attempts to place the smallest contiguous outline around all elements or shapes that are indicated to have an outline.
         *              Opera draws a non-rectangular shape around a construct.
         */
        outline?: CSSWideKeyword | any;

        /**
         * The outline-color property sets the color of the outline of an element. An outline is a line that is drawn around elements, outside the border edge, to make the element stand out.
         */
        outlineColor?: CSSWideKeyword | any;

        /**
         * The outline-offset property offsets the outline and draw it beyond the border edge.
         */
        outlineOffset?: CSSWideKeyword | any;

        /**
         * The overflow property controls how extra content exceeding the bounding box of an element is rendered.
         * It can be used in conjunction with an element that has a fixed width and height, to eliminate text-induced page distortion.
         */
        overflow?: CSSWideKeyword | "auto" | "hidden" | "scroll" | "visible" | undefined;

        /**
         * Specifies the preferred scrolling methods for elements that overflow.
         */
        overflowStyle?: CSSWideKeyword | any;

        /**
         * Controls how extra content exceeding the x-axis of the bounding box of an element is rendered.
         */
        overflowX?: CSSWideKeyword | "auto" | "hidden" | "scroll" | "visible" | undefined;

        /**
         * Controls how extra content exceeding the y-axis of the bounding box of an element is rendered.
         */
        overflowY?: CSSWideKeyword | "auto" | "hidden" | "scroll" | "visible" | undefined;

        /**
         * The padding optional CSS property sets the required padding space on one to four sides of an element.
         * The padding area is the space between an element and its border. Negative values are not allowed but decimal values are permitted.
         * The element size is treated as fixed, and the content of the element shifts toward the center as padding is increased.
         * The padding property is a shorthand to avoid setting each side separately (padding-top, padding-right, padding-bottom, padding-left).
         */
        padding?: CSSWideKeyword | any;

        /**
         * The padding-bottom CSS property of an element sets the padding space required on the bottom of an element.
         * The padding area is the space between the content of the element and its border.
         * Contrary to margin-bottom values, negative values of padding-bottom are invalid.
         */
        paddingBottom?: CSSWideKeyword | any;

        /**
         * The padding-left CSS property of an element sets the padding space required on the left side of an element.
         * The padding area is the space between the content of the element and its border.
         * Contrary to margin-left values, negative values of padding-left are invalid.
         */
        paddingLeft?: CSSWideKeyword | any;

        /**
         * The padding-right CSS property of an element sets the padding space required on the right side of an element.
         * The padding area is the space between the content of the element and its border.
         * Contrary to margin-right values, negative values of padding-right are invalid.
         */
        paddingRight?: CSSWideKeyword | any;

        /**
         * The padding-top CSS property of an element sets the padding space required on the top of an element.
         * The padding area is the space between the content of the element and its border.
         * Contrary to margin-top values, negative values of padding-top are invalid.
         */
        paddingTop?: CSSWideKeyword | any;

        /**
         * The page-break-after property is supported in all major browsers. With CSS3, page-break-* properties are only aliases of the break-* properties.
         * The CSS3 Fragmentation spec defines breaks for all CSS box fragmentation.
         */
        pageBreakAfter?: CSSWideKeyword | any;

        /**
         * The page-break-before property sets the page-breaking behavior before an element.
         * With CSS3, page-break-* properties are only aliases of the break-* properties.
         * The CSS3 Fragmentation spec defines breaks for all CSS box fragmentation.
         */
        pageBreakBefore?: CSSWideKeyword | any;

        /**
         * Sets the page-breaking behavior inside an element. With CSS3, page-break-* properties are only aliases of the break-* properties.
         * The CSS3 Fragmentation spec defines breaks for all CSS box fragmentation.
         */
        pageBreakInside?: CSSWideKeyword | any;

        /**
         * The pause property determines how long a speech media agent should pause before and after presenting an element.
         * It is a shorthand for the pause-before and pause-after properties.
         */
        pause?: CSSWideKeyword | any;

        /**
         * The pause-after property determines how long a speech media agent should pause after presenting an element.
         * It may be replaced by the shorthand property pause, which sets pause time before and after.
         */
        pauseAfter?: CSSWideKeyword | any;

        /**
         * The pause-before property determines how long a speech media agent should pause before presenting an element.
         * It may be replaced by the shorthand property pause, which sets pause time before and after.
         */
        pauseBefore?: CSSWideKeyword | any;

        /**
         * The perspective property defines how far an element is placed from the view on the z-axis, from the screen to the viewer.
         * Perspective defines how an object is viewed. In graphic arts, perspective is the representation on a flat surface of what the viewer's eye would see in a 3D space.
         * (See Wikipedia for more information about graphical perspective and for related illustrations.)
         * The illusion of perspective on a flat surface, such as a computer screen,
         * is created by projecting points on the flat surface as they would appear if the flat surface were a window
         * through which the viewer was looking at the object. In discussion of virtual environments, this flat surface is called a projection plane.
         */
        perspective?: CSSWideKeyword | any;

        /**
         * The perspective-origin property establishes the origin for the perspective property.
         * It effectively sets the X and Y position at which the viewer appears to be looking at the children of the element.
         * When used with perspective, perspective-origin changes the appearance of an object,
         * as if a viewer were looking at it from a different origin.
         * An object appears differently if a viewer is looking directly at it versus looking at it from below, above, or from the side.
         * Thus, the perspective-origin is like a vanishing point.
         * The default value of perspective-origin is 50% 50%.
         * This displays an object as if the viewer's eye were positioned directly at the center of the screen, both top-to-bottom and left-to-right.
         * A value of 0% 0% changes the object as if the viewer was looking toward the top left angle.
         * A value of 100% 100% changes the appearance as if viewed toward the bottom right angle.
         */
        perspectiveOrigin?: CSSWideKeyword | any;

        /**
         * The pointer-events property allows you to control whether an element can be the target for the pointing device (e.g, mouse, pen) events.
         */
        pointerEvents?: CSSWideKeyword | any;

        /**
         * The position property controls the type of positioning used by an element within its parent elements.
         * The effect of the position property depends on a lot of factors, for example the position property of parent elements.
         */
        position?: CSSWideKeyword | "static" | "relative" | "absolute" | "fixed" | "sticky" | undefined;

        /**
         * Obsolete: unsupported.
         * This property determines whether or not a full-width punctuation mark character should be trimmed if it appears at the beginning of a line,
         * so that its "ink" lines up with the first glyph in the line above and below.
         */
        punctuationTrim?: CSSWideKeyword | any;

        /**
         * Sets the type of quotation marks for embedded quotations.
         */
        quotes?: CSSWideKeyword | any;

        /**
         * Controls whether the last region in a chain displays additional 'overset' content according its default overflow property,
         * or if it displays a fragment of content as if it were flowing into a subsequent region.
         */
        regionFragment?: CSSWideKeyword | any;

        /**
         * The rest-after property determines how long a speech media agent should pause after presenting an element's main content,
         * before presenting that element's exit cue sound. It may be replaced by the shorthand property rest, which sets rest time before and after.
         */
        restAfter?: CSSWideKeyword | any;

        /**
         * The rest-before property determines how long a speech media agent should pause after presenting an intro cue sound for an element,
         * before presenting that element's main content. It may be replaced by the shorthand property rest, which sets rest time before and after.
         */
        restBefore?: CSSWideKeyword | any;

        /**
         * Specifies the position an element in relation to the right side of the containing element.
         */
        right?: CSSWideKeyword | any;

        rubyAlign?: CSSWideKeyword | any;

        rubyPosition?: CSSWideKeyword | any;

        /**
         * Defines the alpha channel threshold used to extract a shape from an image. Can be thought of as a "minimum opacity" threshold;
         * that is, a value of 0.5 means that the shape will enclose all the pixels that are more than 50% opaque.
         */
        shapeImageThreshold?: CSSWideKeyword | any;

        /**
         * A future level of CSS Shapes will define a shape-inside property, which will define a shape to wrap content within the element.
         * See Editor's Draft <http://dev.w3.org/csswg/css-shapes/> and CSSWG wiki page on next-level plans <http://wiki.csswg.org/spec/css-shapes>
         */
        shapeInside?: CSSWideKeyword | any;

        /**
         * Adds a margin to a shape-outside. In effect, defines a new shape that is the smallest contour around all the points
         * that are the shape-margin distance outward perpendicular to each point on the underlying shape.
         * For points where a perpendicular direction is not defined (e.g., a triangle corner),
         * takes all points on a circle centered at the point and with a radius of the shape-margin distance.
         * This property accepts only non-negative values.
         */
        shapeMargin?: CSSWideKeyword | any;

        /**
         * Declares a shape around which text should be wrapped, with possible modifications from the shape-margin property.
         * The shape defined by shape-outside and shape-margin changes the geometry of a float element's float area.
         */
        shapeOutside?: CSSWideKeyword | any;

        /**
         * The speak property determines whether or not a speech synthesizer will read aloud the contents of an element.
         */
        speak?: CSSWideKeyword | any;

        /**
         * The speak-as property determines how the speech synthesizer interprets the content: words as whole words or as a sequence of letters,
         * numbers as a numerical value or a sequence of digits, punctuation as pauses in speech or named punctuation characters.
         */
        speakAs?: CSSWideKeyword | any;

        /**
         * SVG: Specifies the opacity of the outline on the current object.
         * See SVG 1.1 https://www.w3.org/TR/SVG/painting.html#StrokeOpacityProperty
         */
        strokeOpacity?: CSSWideKeyword | number | undefined;

        /**
         * SVG: Specifies the width of the outline on the current object.
         * See SVG 1.1 https://www.w3.org/TR/SVG/painting.html#StrokeWidthProperty
         */
        strokeWidth?: CSSWideKeyword | CSSPercentage | CSSLength | undefined;

        /**
         * The tab-size CSS property is used to customise the width of a tab (U+0009) character.
         */
        tabSize?: CSSWideKeyword | any;

        /**
         * The 'table-layout' property controls the algorithm used to lay out the table cells, rows, and columns.
         */
        tableLayout?: CSSWideKeyword | any;

        /**
         * The text-align CSS property describes how inline content like text is aligned in its parent block element.
         * text-align does not control the alignment of block elements itself, only their inline content.
         */
        textAlign?: CSSWideKeyword | any;

        /**
         * The text-align-last CSS property describes how the last line of a block element or a line before line break is aligned in its parent block element.
         */
        textAlignLast?: CSSWideKeyword | any;

        /**
         * The text-decoration CSS property is used to set the text formatting to underline, overline, line-through or blink.
         * underline and overline decorations are positioned under the text, line-through over it.
         */
        textDecoration?: CSSWideKeyword | any;

        /**
         * Sets the color of any text decoration, such as underlines, overlines, and strike throughs.
         */
        textDecorationColor?: CSSWideKeyword | any;

        /**
         * Sets what kind of line decorations are added to an element, such as underlines, overlines, etc.
         */
        textDecorationLine?: CSSWideKeyword | any;

        textDecorationLineThrough?: CSSWideKeyword | any;

        textDecorationNone?: CSSWideKeyword | any;

        textDecorationOverline?: CSSWideKeyword | any;

        /**
         * Specifies what parts of an element’s content are skipped over when applying any text decoration.
         */
        textDecorationSkip?: CSSWideKeyword | any;

        /**
         * This property specifies the style of the text decoration line drawn on the specified element.
         * The intended meaning for the values are the same as those of the border-style-properties.
         */
        textDecorationStyle?: CSSWideKeyword | any;

        textDecorationUnderline?: CSSWideKeyword | any;

        /**
         * The text-emphasis property will apply special emphasis marks to the elements text.
         * Slightly similar to the text-decoration property only that this property can have affect on the line-height.
         * It also is noted that this is shorthand for text-emphasis-style and for text-emphasis-color.
         */
        textEmphasis?: CSSWideKeyword | any;

        /**
         * The text-emphasis-color property specifies the foreground color of the emphasis marks.
         */
        textEmphasisColor?: CSSWideKeyword | any;

        /**
         * The text-emphasis-style property applies special emphasis marks to an element's text.
         */
        textEmphasisStyle?: CSSWideKeyword | any;

        /**
         * This property helps determine an inline box's block-progression dimension,
         * derived from the text-height and font-size properties for non-replaced elements,
         * the height or the width for replaced elements, and the stacked block-progression dimension for inline-block elements.
         * The block-progression dimension determines the position of the padding, border and margin for the element.
         */
        textHeight?: CSSWideKeyword | any;

        /**
         * Specifies the amount of space horizontally that should be left on the first line of the text of an element.
         * This horizontal spacing is at the beginning of the first line and is in respect to the left edge of the containing block box.
         */
        textIndent?: CSSWideKeyword | any;

        textJustifyTrim?: CSSWideKeyword | any;

        textKashidaSpace?: CSSWideKeyword | any;

        /**
         * The text-line-through property is a shorthand property for text-line-through-style, text-line-through-color and text-line-through-mode.
         * (Considered obsolete; use text-decoration instead.)
         */
        textLineThrough?: CSSWideKeyword | any;

        /**
         * Specifies the line colors for the line-through text decoration.
         * (Considered obsolete; use text-decoration-color instead.)
         */
        textLineThroughColor?: CSSWideKeyword | any;

        /**
         * Sets the mode for the line-through text decoration, determining whether the text decoration affects the space characters or not.
         * (Considered obsolete; use text-decoration-skip instead.)
         */
        textLineThroughMode?: CSSWideKeyword | any;

        /**
         * Specifies the line style for line-through text decoration.
         * (Considered obsolete; use text-decoration-style instead.)
         */
        textLineThroughStyle?: CSSWideKeyword | any;

        /**
         * Specifies the line width for the line-through text decoration.
         */
        textLineThroughWidth?: CSSWideKeyword | any;

        /**
         * The text-overflow shorthand CSS property determines how overflowed content that is not displayed is signaled to the users.
         * It can be clipped, display an ellipsis ('…', U+2026 HORIZONTAL ELLIPSIS) or a Web author-defined string.
         * It covers the two long-hand properties text-overflow-mode and text-overflow-ellipsis
         */
        textOverflow?: CSSWideKeyword | any;

        /**
         * The text-overline property is the shorthand for the text-overline-style, text-overline-width, text-overline-color, and text-overline-mode properties.
         */
        textOverline?: CSSWideKeyword | any;

        /**
         * Specifies the line color for the overline text decoration.
         */
        textOverlineColor?: CSSWideKeyword | any;

        /**
         * Sets the mode for the overline text decoration, determining whether the text decoration affects the space characters or not.
         */
        textOverlineMode?: CSSWideKeyword | any;

        /**
         * Specifies the line style for overline text decoration.
         */
        textOverlineStyle?: CSSWideKeyword | any;

        /**
         * Specifies the line width for the overline text decoration.
         */
        textOverlineWidth?: CSSWideKeyword | any;

        /**
         * The text-rendering CSS property provides information to the browser about how to optimize when rendering text.
         * Options are: legibility, speed or geometric precision.
         */
        textRendering?: CSSWideKeyword | any;

        /**
         * Obsolete: unsupported.
         */
        textScript?: CSSWideKeyword | any;

        /**
         * The CSS text-shadow property applies one or more drop shadows to the text and <text-decorations> of an element.
         * Each shadow is specified as an offset from the text, along with optional color and blur radius values.
         */
        textShadow?: CSSWideKeyword | any;

        /**
         * This property transforms text for styling purposes. (It has no effect on the underlying content.)
         */
        textTransform?: CSSWideKeyword | any;

        /**
         * Unsupported.
         * This property will add a underline position value to the element that has an underline defined.
         */
        textUnderlinePosition?: CSSWideKeyword | any;

        /**
         * After review this should be replaced by text-decoration should it not?
         * This property will set the underline style for text with a line value for underline, overline, and line-through.
         */
        textUnderlineStyle?: CSSWideKeyword | any;

        /**
         * This property specifies how far an absolutely positioned box's top margin edge is offset below the top edge of the box's containing block.
         * For relatively positioned boxes, the offset is with respect to the top edges of the box itself (i.e., the box is given a position in the normal flow,
         * then offset from that position according to these properties).
         */
        top?: CSSWideKeyword | any;

        /**
         * Determines whether touch input may trigger default behavior supplied by the user agent, such as panning or zooming.
         */
        touchAction?: CSSWideKeyword | any;

        /**
         * CSS transforms allow elements styled with CSS to be transformed in two-dimensional or three-dimensional space.
         * Using this property, elements can be translated, rotated, scaled, and skewed. The value list may consist of 2D and/or 3D transform values.
         */
        transform?: CSSWideKeyword | any;

        /**
         * This property defines the origin of the transformation axes relative to the element to which the transformation is applied.
         */
        transformOrigin?: CSSWideKeyword | any;

        /**
         * This property allows you to define the relative position of the origin of the transformation grid along the z-axis.
         */
        transformOriginZ?: CSSWideKeyword | any;

        /**
         * This property specifies how nested elements are rendered in 3D space relative to their parent.
         */
        transformStyle?: CSSWideKeyword | any;

        /**
         * The transition CSS property is a shorthand property for transition-property, transition-duration, transition-timing-function,
         * and transition-delay. It allows to define the transition between two states of an element.
         */
        transition?: CSSWideKeyword | any;

        /**
         * Defines when the transition will start. A value of ‘0s’ means the transition will execute as soon as the property is changed.
         * Otherwise, the value specifies an offset from the moment the property is changed, and the transition will delay execution by that offset.
         */
        transitionDelay?: CSSWideKeyword | any;

        /**
         * The 'transition-duration' property specifies the length of time a transition animation takes to complete.
         */
        transitionDuration?: CSSWideKeyword | any;

        /**
         * The 'transition-property' property specifies the name of the CSS property to which the transition is applied.
         */
        transitionProperty?: CSSWideKeyword | any;

        /**
         * Sets the pace of action within a transition
         */
        transitionTimingFunction?: CSSWideKeyword | any;

        /**
         * The unicode-bidi CSS property specifies the level of embedding with respect to the bidirectional algorithm.
         */
        unicodeBidi?: CSSWideKeyword | any;

        /**
         * unicode-range allows you to set a specific range of characters to be downloaded from a font (embedded using @font-face) and made available for use on the current page.
         */
        unicodeRange?: CSSWideKeyword | any;

        /**
         * This is for all the high level UX stuff.
         */
        userFocus?: CSSWideKeyword | any;

        /**
         * For inputing user content
         */
        userInput?: CSSWideKeyword | any;

        /**
         * The vertical-align property controls how inline elements or text are vertically aligned compared to the baseline.
         * If this property is used on table-cells it controls the vertical alignment of content of the table cell.
         */
        verticalAlign?: CSSWideKeyword | any;

        /**
         * The visibility property specifies whether the boxes generated by an element are rendered.
         */
        visibility?: CSSWideKeyword | any;

        /**
         * The voice-balance property sets the apparent position (in stereo sound) of the synthesized voice for spoken media.
         */
        voiceBalance?: CSSWideKeyword | any;

        /**
         * The voice-duration property allows the author to explicitly set the amount of time it should take a speech synthesizer to read an element's content,
         * for example to allow the speech to be synchronized with other media.
         * With a value of auto (the default) the length of time it takes to read the content is determined by the content itself and the voice-rate property.
         */
        voiceDuration?: CSSWideKeyword | any;

        /**
         * The voice-family property sets the speaker's voice used by a speech media agent to read an element.
         * The speaker may be specified as a named character (to match a voice option in the speech reading software)
         * or as a generic description of the age and gender of the voice.
         * Similar to the font-family property for visual media,
         * a comma-separated list of fallback options may be given in case the speech reader does not recognize the character name
         * or cannot synthesize the requested combination of generic properties.
         */
        voiceFamily?: CSSWideKeyword | any;

        /**
         * The voice-pitch property sets pitch or tone (high or low) for the synthesized speech when reading an element;
         * the pitch may be specified absolutely or relative to the normal pitch for the voice-family used to read the text.
         */
        voicePitch?: CSSWideKeyword | any;

        /**
         * The voice-range property determines how much variation in pitch or tone will be created by the speech synthesize when reading an element.
         * Emphasized text, grammatical structures and punctuation may all be rendered as changes in pitch,
         * this property determines how strong or obvious those changes are;
         * large ranges are associated with enthusiastic or emotional speech,
         * while small ranges are associated with flat or mechanical speech.
         */
        voiceRange?: CSSWideKeyword | any;

        /**
         * The voice-rate property sets the speed at which the voice synthesized by a speech media agent will read content.
         */
        voiceRate?: CSSWideKeyword | any;

        /**
         * The voice-stress property sets the level of vocal emphasis to be used for synthesized speech reading the element.
         */
        voiceStress?: CSSWideKeyword | any;

        /**
         * The voice-volume property sets the volume for spoken content in speech media. It replaces the deprecated volume property.
         */
        voiceVolume?: CSSWideKeyword | any;

        /**
         * The white-space property controls whether and how white space inside the element is collapsed, and whether lines may wrap at unforced "soft wrap" opportunities.
         */
        whiteSpace?: CSSWideKeyword | any;

        /**
         * Obsolete: unsupported.
         */
        whiteSpaceTreatment?: CSSWideKeyword | any;

        /**
         * In paged media, this property defines the minimum number of lines
         * that must be left at the top of the second page.
         * See CSS 3 orphans, widows properties https://drafts.csswg.org/css-break-3/#widows-orphans
         */
        widows?: CSSWideKeyword | number | undefined;

        /**
         * Specifies the width of the content area of an element. The content area of the element width does not include the padding, border, and margin of the element.
         */
        width?: CSSWideKeyword | any;

        /**
         * The word-break property is often used when there is long generated content that is strung together without and spaces or hyphens to beak apart.
         * A common case of this is when there is a long URL that does not have any hyphens. This case could potentially cause the breaking of the layout as it could extend past the parent element.
         */
        wordBreak?: CSSWideKeyword | any;

        /**
         * The word-spacing CSS property specifies the spacing behavior between "words".
         */
        wordSpacing?: CSSWideKeyword | any;

        /**
         * An alias of css/properties/overflow-wrap, word-wrap defines whether to break words when the content exceeds the boundaries of its container.
         */
        wordWrap?: CSSWideKeyword | any;

        /**
         * Specifies how exclusions affect inline content within block-level elements. Elements lay out their inline content in their content area but wrap around exclusion areas.
         */
        wrapFlow?: CSSWideKeyword | any;

        /**
         * Set the value that is used to offset the inner wrap shape from other shapes. Inline content that intersects a shape with this property will be pushed by this shape's margin.
         */
        wrapMargin?: CSSWideKeyword | any;

        /**
         * Obsolete and unsupported. Do not use.
         * This CSS property controls the text when it reaches the end of the block in which it is enclosed.
         */
        wrapOption?: CSSWideKeyword | any;

        /**
         * writing-mode specifies if lines of text are laid out horizontally or vertically, and the direction which lines of text and blocks progress.
         */
        writingMode?: CSSWideKeyword | any;

        /**
         * The z-index property specifies the z-order of an element and its descendants.
         * When elements overlap, z-order determines which one covers the other.
         * See CSS 2 z-index property https://www.w3.org/TR/CSS2/visuren.html#z-index
         */
        zIndex?: CSSWideKeyword | "auto" | number | undefined;

        /**
         * Sets the initial zoom factor of a document defined by @viewport.
         * See CSS zoom descriptor https://drafts.csswg.org/css-device-adapt/#zoom-desc
         */
        zoom?: CSSWideKeyword | "auto" | number | CSSPercentage | undefined;

        [propertyName: string]: any;
    }

    // All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
    interface AriaAttributes {
        /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
        "aria-activedescendant"?: string | undefined;
        /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
        "aria-atomic"?: boolean | "false" | "true" | undefined;
        /**
         * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
         * presented if they are made.
         */
        "aria-autocomplete"?: "none" | "inline" | "list" | "both" | undefined;
        /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
        "aria-busy"?: boolean | "false" | "true" | undefined;
        /**
         * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
         * @see aria-pressed @see aria-selected.
         */
        "aria-checked"?: boolean | "false" | "mixed" | "true" | undefined;
        /**
         * Defines the total number of columns in a table, grid, or treegrid.
         * @see aria-colindex.
         */
        "aria-colcount"?: number | undefined;
        /**
         * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
         * @see aria-colcount @see aria-colspan.
         */
        "aria-colindex"?: number | undefined;
        /**
         * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
         * @see aria-colindex @see aria-rowspan.
         */
        "aria-colspan"?: number | undefined;
        /**
         * Identifies the element (or elements) whose contents or presence are controlled by the current element.
         * @see aria-owns.
         */
        "aria-controls"?: string | undefined;
        /** Indicates the element that represents the current item within a container or set of related elements. */
        "aria-current"?: boolean | "false" | "true" | "page" | "step" | "location" | "date" | "time" | undefined;
        /**
         * Identifies the element (or elements) that describes the object.
         * @see aria-labelledby
         */
        "aria-describedby"?: string | undefined;
        /**
         * Identifies the element that provides a detailed, extended description for the object.
         * @see aria-describedby.
         */
        "aria-details"?: string | undefined;
        /**
         * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
         * @see aria-hidden @see aria-readonly.
         */
        "aria-disabled"?: boolean | "false" | "true" | undefined;
        /**
         * Indicates what functions can be performed when a dragged object is released on the drop target.
         * @deprecated in ARIA 1.1
         */
        "aria-dropeffect"?: "none" | "copy" | "execute" | "link" | "move" | "popup" | undefined;
        /**
         * Identifies the element that provides an error message for the object.
         * @see aria-invalid @see aria-describedby.
         */
        "aria-errormessage"?: string | undefined;
        /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
        "aria-expanded"?: boolean | "false" | "true" | undefined;
        /**
         * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
         * allows assistive technology to override the general default of reading in document source order.
         */
        "aria-flowto"?: string | undefined;
        /**
         * Indicates an element's "grabbed" state in a drag-and-drop operation.
         * @deprecated in ARIA 1.1
         */
        "aria-grabbed"?: boolean | "false" | "true" | undefined;
        /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
        "aria-haspopup"?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog" | undefined;
        /**
         * Indicates whether the element is exposed to an accessibility API.
         * @see aria-disabled.
         */
        "aria-hidden"?: boolean | "false" | "true" | undefined;
        /**
         * Indicates the entered value does not conform to the format expected by the application.
         * @see aria-errormessage.
         */
        "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling" | undefined;
        /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
        "aria-keyshortcuts"?: string | undefined;
        /**
         * Defines a string value that labels the current element.
         * @see aria-labelledby.
         */
        "aria-label"?: string | undefined;
        /**
         * Identifies the element (or elements) that labels the current element.
         * @see aria-describedby.
         */
        "aria-labelledby"?: string | undefined;
        /** Defines the hierarchical level of an element within a structure. */
        "aria-level"?: number | undefined;
        /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
        "aria-live"?: "off" | "assertive" | "polite" | undefined;
        /** Indicates whether an element is modal when displayed. */
        "aria-modal"?: boolean | "false" | "true" | undefined;
        /** Indicates whether a text box accepts multiple lines of input or only a single line. */
        "aria-multiline"?: boolean | "false" | "true" | undefined;
        /** Indicates that the user may select more than one item from the current selectable descendants. */
        "aria-multiselectable"?: boolean | "false" | "true" | undefined;
        /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
        "aria-orientation"?: "horizontal" | "vertical" | undefined;
        /**
         * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
         * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
         * @see aria-controls.
         */
        "aria-owns"?: string | undefined;
        /**
         * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
         * A hint could be a sample value or a brief description of the expected format.
         */
        "aria-placeholder"?: string | undefined;
        /**
         * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
         * @see aria-setsize.
         */
        "aria-posinset"?: number | undefined;
        /**
         * Indicates the current "pressed" state of toggle buttons.
         * @see aria-checked @see aria-selected.
         */
        "aria-pressed"?: boolean | "false" | "mixed" | "true" | undefined;
        /**
         * Indicates that the element is not editable, but is otherwise operable.
         * @see aria-disabled.
         */
        "aria-readonly"?: boolean | "false" | "true" | undefined;
        /**
         * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
         * @see aria-atomic.
         */
        "aria-relevant"?: "additions" | "additions text" | "all" | "removals" | "text" | undefined;
        /** Indicates that user input is required on the element before a form may be submitted. */
        "aria-required"?: boolean | "false" | "true" | undefined;
        /** Defines a human-readable, author-localized description for the role of an element. */
        "aria-roledescription"?: string | undefined;
        /**
         * Defines the total number of rows in a table, grid, or treegrid.
         * @see aria-rowindex.
         */
        "aria-rowcount"?: number | undefined;
        /**
         * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
         * @see aria-rowcount @see aria-rowspan.
         */
        "aria-rowindex"?: number | undefined;
        /**
         * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
         * @see aria-rowindex @see aria-colspan.
         */
        "aria-rowspan"?: number | undefined;
        /**
         * Indicates the current "selected" state of various widgets.
         * @see aria-checked @see aria-pressed.
         */
        "aria-selected"?: boolean | "false" | "true" | undefined;
        /**
         * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
         * @see aria-posinset.
         */
        "aria-setsize"?: number | undefined;
        /** Indicates if items in a table or grid are sorted in ascending or descending order. */
        "aria-sort"?: "none" | "ascending" | "descending" | "other" | undefined;
        /** Defines the maximum allowed value for a range widget. */
        "aria-valuemax"?: number | undefined;
        /** Defines the minimum allowed value for a range widget. */
        "aria-valuemin"?: number | undefined;
        /**
         * Defines the current value for a range widget.
         * @see aria-valuetext.
         */
        "aria-valuenow"?: number | undefined;
        /** Defines the human readable text alternative of aria-valuenow for a range widget. */
        "aria-valuetext"?: string | undefined;
    }

    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        // React-specific Attributes
        defaultChecked?: boolean | undefined;
        defaultValue?: string | string[] | undefined;
        suppressContentEditableWarning?: boolean | undefined;

        // Standard HTML Attributes
        accessKey?: string | undefined;
        autoFocus?: boolean | undefined;
        className?: string | undefined;
        contentEditable?: boolean | undefined;
        contextMenu?: string | undefined;
        dir?: string | undefined;
        draggable?: boolean | undefined;
        hidden?: boolean | undefined;
        id?: string | undefined;
        lang?: string | undefined;
        slot?: string | undefined;
        spellCheck?: boolean | undefined;
        style?: CSSProperties | undefined;
        tabIndex?: number | undefined;
        title?: string | undefined;

        // Unknown
        radioGroup?: string | undefined; // <command>, <menuitem>

        // WAI-ARIA
        role?: string | undefined;

        // RDFa Attributes
        about?: string | undefined;
        content?: string | undefined;
        datatype?: string | undefined;
        inlist?: any;
        prefix?: string | undefined;
        property?: string | undefined;
        rel?: string | undefined;
        resource?: string | undefined;
        rev?: string | undefined;
        typeof?: string | undefined;
        vocab?: string | undefined;

        // Non-standard Attributes
        autoCapitalize?: string | undefined;
        autoCorrect?: string | undefined;
        autoSave?: string | undefined;
        color?: string | undefined;
        itemProp?: string | undefined;
        itemScope?: boolean | undefined;
        itemType?: string | undefined;
        itemID?: string | undefined;
        itemRef?: string | undefined;
        results?: number | undefined;
        security?: string | undefined;
        unselectable?: boolean | undefined;

        // Living Standard
        /**
         * Hints at the type of data that might be entered by the user while editing the element or its contents
         * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
         */
        inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search" | undefined;
        /**
         * Specify that a standard HTML element should behave like a defined custom built-in element
         * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
         */
        is?: string | undefined;
        /**
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/exportparts}
         */
        exportparts?: string | undefined;
        /**
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/part}
         */
        part?: string | undefined;
    }

    interface AllHTMLAttributes<T> extends HTMLAttributes<T> {
        // Standard HTML Attributes
        accept?: string | undefined;
        acceptCharset?: string | undefined;
        action?: string | undefined;
        allowFullScreen?: boolean | undefined;
        allowTransparency?: boolean | undefined;
        alt?: string | undefined;
        as?: string | undefined;
        async?: boolean | undefined;
        autoComplete?: string | undefined;
        autoPlay?: boolean | undefined;
        capture?: boolean | string | undefined;
        cellPadding?: number | string | undefined;
        cellSpacing?: number | string | undefined;
        charSet?: string | undefined;
        challenge?: string | undefined;
        checked?: boolean | undefined;
        cite?: string | undefined;
        classID?: string | undefined;
        cols?: number | undefined;
        colSpan?: number | undefined;
        controls?: boolean | undefined;
        coords?: string | undefined;
        crossOrigin?: CrossOrigin;
        data?: string | undefined;
        dateTime?: string | undefined;
        default?: boolean | undefined;
        defer?: boolean | undefined;
        disabled?: boolean | undefined;
        download?: any;
        encType?: string | undefined;
        form?: string | undefined;
        formAction?: string | undefined;
        formEncType?: string | undefined;
        formMethod?: string | undefined;
        formNoValidate?: boolean | undefined;
        formTarget?: string | undefined;
        frameBorder?: number | string | undefined;
        headers?: string | undefined;
        height?: number | string | undefined;
        high?: number | undefined;
        href?: string | undefined;
        hrefLang?: string | undefined;
        htmlFor?: string | undefined;
        httpEquiv?: string | undefined;
        integrity?: string | undefined;
        keyParams?: string | undefined;
        keyType?: string | undefined;
        kind?: string | undefined;
        label?: string | undefined;
        list?: string | undefined;
        loop?: boolean | undefined;
        low?: number | undefined;
        manifest?: string | undefined;
        marginHeight?: number | undefined;
        marginWidth?: number | undefined;
        max?: number | string | undefined;
        maxLength?: number | undefined;
        media?: string | undefined;
        mediaGroup?: string | undefined;
        method?: string | undefined;
        min?: number | string | undefined;
        minLength?: number | undefined;
        multiple?: boolean | undefined;
        muted?: boolean | undefined;
        name?: string | undefined;
        nonce?: string | undefined;
        noValidate?: boolean | undefined;
        open?: boolean | undefined;
        optimum?: number | undefined;
        pattern?: string | undefined;
        placeholder?: string | undefined;
        playsInline?: boolean | undefined;
        poster?: string | undefined;
        preload?: string | undefined;
        readOnly?: boolean | undefined;
        required?: boolean | undefined;
        reversed?: boolean | undefined;
        rows?: number | undefined;
        rowSpan?: number | undefined;
        sandbox?: string | undefined;
        scope?: string | undefined;
        scoped?: boolean | undefined;
        scrolling?: string | undefined;
        seamless?: boolean | undefined;
        selected?: boolean | undefined;
        shape?: string | undefined;
        size?: number | undefined;
        sizes?: string | undefined;
        span?: number | undefined;
        src?: string | undefined;
        srcDoc?: string | undefined;
        srcLang?: string | undefined;
        srcSet?: string | undefined;
        start?: number | undefined;
        step?: number | string | undefined;
        summary?: string | undefined;
        target?: string | undefined;
        type?: string | undefined;
        useMap?: string | undefined;
        value?: string | string[] | number | undefined;
        width?: number | string | undefined;
        wmode?: string | undefined;
        wrap?: string | undefined;
    }

    interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
        download?: any;
        href?: string | undefined;
        hrefLang?: string | undefined;
        media?: string | undefined;
        target?: string | undefined;
    }

    interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {}

    interface AreaHTMLAttributes<T> extends HTMLAttributes<T> {
        alt?: string | undefined;
        coords?: string | undefined;
        download?: any;
        href?: string | undefined;
        hrefLang?: string | undefined;
        media?: string | undefined;
        shape?: string | undefined;
        target?: string | undefined;
    }

    interface BaseHTMLAttributes<T> extends HTMLAttributes<T> {
        href?: string | undefined;
        target?: string | undefined;
    }

    interface BlockquoteHTMLAttributes<T> extends HTMLAttributes<T> {
        cite?: string | undefined;
    }

    interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
        disabled?: boolean | undefined;
        form?: string | undefined;
        formAction?: string | undefined;
        formEncType?: string | undefined;
        formMethod?: string | undefined;
        formNoValidate?: boolean | undefined;
        formTarget?: string | undefined;
        name?: string | undefined;
        type?: string | undefined;
        value?: string | string[] | number | undefined;
    }

    interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
        height?: number | string | undefined;
        width?: number | string | undefined;
    }

    interface ColHTMLAttributes<T> extends HTMLAttributes<T> {
        span?: number | undefined;
    }

    interface ColgroupHTMLAttributes<T> extends HTMLAttributes<T> {
        span?: number | undefined;
    }

    interface DataHTMLAttributes<T> extends HTMLAttributes<T> {
        value?: string | string[] | number | undefined;
    }

    interface DetailsHTMLAttributes<T> extends HTMLAttributes<T> {
        open?: boolean | undefined;
        name?: string | undefined;
    }

    interface DelHTMLAttributes<T> extends HTMLAttributes<T> {
        cite?: string | undefined;
        dateTime?: string | undefined;
    }

    interface EmbedHTMLAttributes<T> extends HTMLAttributes<T> {
        height?: number | string | undefined;
        src?: string | undefined;
        type?: string | undefined;
        width?: number | string | undefined;
    }

    interface FieldsetHTMLAttributes<T> extends HTMLAttributes<T> {
        disabled?: boolean | undefined;
        form?: string | undefined;
        name?: string | undefined;
    }

    interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
        acceptCharset?: string | undefined;
        action?: string | undefined;
        autoComplete?: string | undefined;
        encType?: string | undefined;
        method?: string | undefined;
        name?: string | undefined;
        noValidate?: boolean | undefined;
        target?: string | undefined;
    }

    interface HtmlHTMLAttributes<T> extends HTMLAttributes<T> {
        manifest?: string | undefined;
    }

    interface IframeHTMLAttributes<T> extends HTMLAttributes<T> {
        allowFullScreen?: boolean | undefined;
        allowTransparency?: boolean | undefined;
        frameBorder?: number | string | undefined;
        height?: number | string | undefined;
        marginHeight?: number | undefined;
        marginWidth?: number | undefined;
        name?: string | undefined;
        sandbox?: string | undefined;
        scrolling?: string | undefined;
        seamless?: boolean | undefined;
        src?: string | undefined;
        srcDoc?: string | undefined;
        width?: number | string | undefined;
    }

    interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
        alt?: string | undefined;
        crossOrigin?: CrossOrigin;
        height?: number | string | undefined;
        sizes?: string | undefined;
        src?: string | undefined;
        srcSet?: string | undefined;
        useMap?: string | undefined;
        width?: number | string | undefined;
    }

    interface InsHTMLAttributes<T> extends HTMLAttributes<T> {
        cite?: string | undefined;
        dateTime?: string | undefined;
    }

    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
        accept?: string | undefined;
        alt?: string | undefined;
        autoComplete?: string | undefined;
        capture?: boolean | string | undefined; // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
        checked?: boolean | undefined;
        disabled?: boolean | undefined;
        form?: string | undefined;
        formAction?: string | undefined;
        formEncType?: string | undefined;
        formMethod?: string | undefined;
        formNoValidate?: boolean | undefined;
        formTarget?: string | undefined;
        height?: number | string | undefined;
        list?: string | undefined;
        max?: number | string | undefined;
        maxLength?: number | undefined;
        min?: number | string | undefined;
        minLength?: number | undefined;
        multiple?: boolean | undefined;
        name?: string | undefined;
        pattern?: string | undefined;
        placeholder?: string | undefined;
        readOnly?: boolean | undefined;
        required?: boolean | undefined;
        size?: number | undefined;
        src?: string | undefined;
        step?: number | string | undefined;
        type?: string | undefined;
        value?: string | string[] | number | undefined;
        width?: number | string | undefined;

        onChange?: ChangeEventHandler<T> | undefined;
    }

    interface KeygenHTMLAttributes<T> extends HTMLAttributes<T> {
        challenge?: string | undefined;
        disabled?: boolean | undefined;
        form?: string | undefined;
        keyType?: string | undefined;
        keyParams?: string | undefined;
        name?: string | undefined;
    }

    interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
        form?: string | undefined;
        htmlFor?: string | undefined;
    }

    interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
        value?: string | string[] | number | undefined;
    }

    interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
        as?: string | undefined;
        crossOrigin?: CrossOrigin;
        fetchPriority?: "high" | "low" | "auto";
        href?: string | undefined;
        hrefLang?: string | undefined;
        integrity?: string | undefined;
        imageSrcSet?: string | undefined;
        media?: string | undefined;
        sizes?: string | undefined;
        type?: string | undefined;
    }

    interface MapHTMLAttributes<T> extends HTMLAttributes<T> {
        name?: string | undefined;
    }

    interface MenuHTMLAttributes<T> extends HTMLAttributes<T> {
        type?: string | undefined;
    }

    interface MediaHTMLAttributes<T> extends HTMLAttributes<T> {
        autoPlay?: boolean | undefined;
        controls?: boolean | undefined;
        crossOrigin?: CrossOrigin;
        loop?: boolean | undefined;
        mediaGroup?: string | undefined;
        muted?: boolean | undefined;
        playsinline?: boolean | undefined;
        preload?: string | undefined;
        src?: string | undefined;
    }

    interface MetaHTMLAttributes<T> extends HTMLAttributes<T> {
        charSet?: string | undefined;
        content?: string | undefined;
        httpEquiv?: string | undefined;
        media?: string | undefined;
        name?: string | undefined;
    }

    interface MeterHTMLAttributes<T> extends HTMLAttributes<T> {
        form?: string | undefined;
        high?: number | undefined;
        low?: number | undefined;
        max?: number | string | undefined;
        min?: number | string | undefined;
        optimum?: number | undefined;
        value?: string | string[] | number | undefined;
    }

    interface QuoteHTMLAttributes<T> extends HTMLAttributes<T> {
        cite?: string | undefined;
    }

    interface ObjectHTMLAttributes<T> extends HTMLAttributes<T> {
        classID?: string | undefined;
        data?: string | undefined;
        form?: string | undefined;
        height?: number | string | undefined;
        name?: string | undefined;
        type?: string | undefined;
        useMap?: string | undefined;
        width?: number | string | undefined;
        wmode?: string | undefined;
    }

    interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
        reversed?: boolean | undefined;
        start?: number | undefined;
    }

    interface OptgroupHTMLAttributes<T> extends HTMLAttributes<T> {
        disabled?: boolean | undefined;
        label?: string | undefined;
    }

    interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
        disabled?: boolean | undefined;
        label?: string | undefined;
        selected?: boolean | undefined;
        value?: string | string[] | number | undefined;
    }

    interface OutputHTMLAttributes<T> extends HTMLAttributes<T> {
        form?: string | undefined;
        htmlFor?: string | undefined;
        name?: string | undefined;
    }

    interface ParamHTMLAttributes<T> extends HTMLAttributes<T> {
        name?: string | undefined;
        value?: string | string[] | number | undefined;
    }

    interface ProgressHTMLAttributes<T> extends HTMLAttributes<T> {
        max?: number | string | undefined;
        value?: string | string[] | number | undefined;
    }

    interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
        async?: boolean | undefined;
        charSet?: string | undefined;
        crossOrigin?: CrossOrigin;
        defer?: boolean | undefined;
        integrity?: string | undefined;
        nonce?: string | undefined;
        src?: string | undefined;
        type?: string | undefined;
    }

    interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
        autoComplete?: string | undefined;
        disabled?: boolean | undefined;
        form?: string | undefined;
        multiple?: boolean | undefined;
        name?: string | undefined;
        required?: boolean | undefined;
        size?: number | undefined;
        value?: string | string[] | number | undefined;
        onChange?: ChangeEventHandler<T> | undefined;
    }

    interface SourceHTMLAttributes<T> extends HTMLAttributes<T> {
        media?: string | undefined;
        sizes?: string | undefined;
        src?: string | undefined;
        srcSet?: string | undefined;
        type?: string | undefined;
    }

    interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
        media?: string | undefined;
        nonce?: string | undefined;
        scoped?: boolean | undefined;
        type?: string | undefined;
    }

    interface TableHTMLAttributes<T> extends HTMLAttributes<T> {
        cellPadding?: number | string | undefined;
        cellSpacing?: number | string | undefined;
        summary?: string | undefined;
    }

    interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
        autoComplete?: string | undefined;
        cols?: number | undefined;
        dirName?: string | undefined;
        disabled?: boolean | undefined;
        form?: string | undefined;
        maxLength?: number | undefined;
        minLength?: number | undefined;
        name?: string | undefined;
        placeholder?: string | undefined;
        readOnly?: boolean | undefined;
        required?: boolean | undefined;
        rows?: number | undefined;
        value?: string | string[] | number | undefined;
        wrap?: string | undefined;

        onChange?: ChangeEventHandler<T> | undefined;
    }

    interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
        colSpan?: number | undefined;
        headers?: string | undefined;
        rowSpan?: number | undefined;
    }

    interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
        colSpan?: number | undefined;
        headers?: string | undefined;
        rowSpan?: number | undefined;
        scope?: string | undefined;
    }

    interface TimeHTMLAttributes<T> extends HTMLAttributes<T> {
        dateTime?: string | undefined;
    }

    interface TrackHTMLAttributes<T> extends HTMLAttributes<T> {
        default?: boolean | undefined;
        kind?: string | undefined;
        label?: string | undefined;
        src?: string | undefined;
        srcLang?: string | undefined;
    }

    interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
        height?: number | string | undefined;
        playsInline?: boolean | undefined;
        poster?: string | undefined;
        width?: number | string | undefined;
    }

    // this list is "complete" in that it contains every SVG attribute
    // that React supports, but the types can be improved.
    // Full list here: https://facebook.github.io/react/docs/dom-elements.html
    //
    // The three broad type categories are (in order of restrictiveness):
    //   - "number | string"
    //   - "string"
    //   - union of string literals
    interface SVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        // Attributes which also defined in HTMLAttributes
        // See comment in SVGDOMPropertyConfig.js
        className?: string | undefined;
        color?: string | undefined;
        height?: number | string | undefined;
        id?: string | undefined;
        lang?: string | undefined;
        max?: number | string | undefined;
        media?: string | undefined;
        method?: string | undefined;
        min?: number | string | undefined;
        name?: string | undefined;
        style?: CSSProperties | undefined;
        target?: string | undefined;
        type?: string | undefined;
        width?: number | string | undefined;

        // Other HTML properties supported by SVG elements in browsers
        role?: string | undefined;
        tabIndex?: number | undefined;

        // SVG Specific attributes
        accentHeight?: number | string | undefined;
        accumulate?: "none" | "sum" | undefined;
        additive?: "replace" | "sum" | undefined;
        alignmentBaseline?:
            | "auto"
            | "baseline"
            | "before-edge"
            | "text-before-edge"
            | "middle"
            | "central"
            | "after-edge"
            | "text-after-edge"
            | "ideographic"
            | "alphabetic"
            | "hanging"
            | "mathematical"
            | "inherit"
            | undefined;
        allowReorder?: "no" | "yes" | undefined;
        alphabetic?: number | string | undefined;
        amplitude?: number | string | undefined;
        arabicForm?: "initial" | "medial" | "terminal" | "isolated" | undefined;
        ascent?: number | string | undefined;
        attributeName?: string | undefined;
        attributeType?: string | undefined;
        autoReverse?: number | string | undefined;
        azimuth?: number | string | undefined;
        baseFrequency?: number | string | undefined;
        baselineShift?: number | string | undefined;
        baseProfile?: number | string | undefined;
        bbox?: number | string | undefined;
        begin?: number | string | undefined;
        bias?: number | string | undefined;
        by?: number | string | undefined;
        calcMode?: number | string | undefined;
        capHeight?: number | string | undefined;
        clip?: number | string | undefined;
        clipPath?: string | undefined;
        clipPathUnits?: number | string | undefined;
        clipRule?: number | string | undefined;
        colorInterpolation?: number | string | undefined;
        colorInterpolationFilters?: "auto" | "sRGB" | "linearRGB" | "inherit" | undefined;
        colorProfile?: number | string | undefined;
        colorRendering?: number | string | undefined;
        contentScriptType?: number | string | undefined;
        contentStyleType?: number | string | undefined;
        cursor?: number | string | undefined;
        cx?: number | string | undefined;
        cy?: number | string | undefined;
        d?: string | undefined;
        decelerate?: number | string | undefined;
        descent?: number | string | undefined;
        diffuseConstant?: number | string | undefined;
        direction?: number | string | undefined;
        display?: number | string | undefined;
        divisor?: number | string | undefined;
        dominantBaseline?: number | string | undefined;
        dur?: number | string | undefined;
        dx?: number | string | undefined;
        dy?: number | string | undefined;
        edgeMode?: number | string | undefined;
        elevation?: number | string | undefined;
        enableBackground?: number | string | undefined;
        end?: number | string | undefined;
        exponent?: number | string | undefined;
        externalResourcesRequired?: number | string | undefined;
        fill?: string | undefined;
        fillOpacity?: number | string | undefined;
        fillRule?: "nonzero" | "evenodd" | "inherit" | undefined;
        filter?: string | undefined;
        filterRes?: number | string | undefined;
        filterUnits?: number | string | undefined;
        floodColor?: number | string | undefined;
        floodOpacity?: number | string | undefined;
        focusable?: number | string | undefined;
        fontFamily?: string | undefined;
        fontSize?: number | string | undefined;
        fontSizeAdjust?: number | string | undefined;
        fontStretch?: number | string | undefined;
        fontStyle?: number | string | undefined;
        fontVariant?: number | string | undefined;
        fontWeight?: number | string | undefined;
        format?: number | string | undefined;
        fr?: number | string | undefined;
        from?: number | string | undefined;
        fx?: number | string | undefined;
        fy?: number | string | undefined;
        g1?: number | string | undefined;
        g2?: number | string | undefined;
        glyphName?: number | string | undefined;
        glyphOrientationHorizontal?: number | string | undefined;
        glyphOrientationVertical?: number | string | undefined;
        glyphRef?: number | string | undefined;
        gradientTransform?: string | undefined;
        gradientUnits?: string | undefined;
        hanging?: number | string | undefined;
        horizAdvX?: number | string | undefined;
        horizOriginX?: number | string | undefined;
        href?: string | undefined;
        ideographic?: number | string | undefined;
        imageRendering?: number | string | undefined;
        in2?: number | string | undefined;
        in?: string | undefined;
        intercept?: number | string | undefined;
        k1?: number | string | undefined;
        k2?: number | string | undefined;
        k3?: number | string | undefined;
        k4?: number | string | undefined;
        k?: number | string | undefined;
        kernelMatrix?: number | string | undefined;
        kernelUnitLength?: number | string | undefined;
        kerning?: number | string | undefined;
        keyPoints?: number | string | undefined;
        keySplines?: number | string | undefined;
        keyTimes?: number | string | undefined;
        lengthAdjust?: number | string | undefined;
        letterSpacing?: number | string | undefined;
        lightingColor?: number | string | undefined;
        limitingConeAngle?: number | string | undefined;
        local?: number | string | undefined;
        markerEnd?: string | undefined;
        markerHeight?: number | string | undefined;
        markerMid?: string | undefined;
        markerStart?: string | undefined;
        markerUnits?: number | string | undefined;
        markerWidth?: number | string | undefined;
        mask?: string | undefined;
        maskContentUnits?: number | string | undefined;
        maskUnits?: number | string | undefined;
        mathematical?: number | string | undefined;
        mode?: number | string | undefined;
        numOctaves?: number | string | undefined;
        offset?: number | string | undefined;
        opacity?: number | string | undefined;
        operator?: number | string | undefined;
        order?: number | string | undefined;
        orient?: number | string | undefined;
        orientation?: number | string | undefined;
        origin?: number | string | undefined;
        overflow?: number | string | undefined;
        overlinePosition?: number | string | undefined;
        overlineThickness?: number | string | undefined;
        paintOrder?: number | string | undefined;
        panose1?: number | string | undefined;
        pathLength?: number | string | undefined;
        patternContentUnits?: string | undefined;
        patternTransform?: number | string | undefined;
        patternUnits?: string | undefined;
        pointerEvents?: number | string | undefined;
        points?: string | undefined;
        pointsAtX?: number | string | undefined;
        pointsAtY?: number | string | undefined;
        pointsAtZ?: number | string | undefined;
        preserveAlpha?: number | string | undefined;
        preserveAspectRatio?: string | undefined;
        primitiveUnits?: number | string | undefined;
        r?: number | string | undefined;
        radius?: number | string | undefined;
        refX?: number | string | undefined;
        refY?: number | string | undefined;
        renderingIntent?: number | string | undefined;
        repeatCount?: number | string | undefined;
        repeatDur?: number | string | undefined;
        requiredExtensions?: number | string | undefined;
        requiredFeatures?: number | string | undefined;
        restart?: number | string | undefined;
        result?: string | undefined;
        rotate?: number | string | undefined;
        rx?: number | string | undefined;
        ry?: number | string | undefined;
        scale?: number | string | undefined;
        seed?: number | string | undefined;
        shapeRendering?: number | string | undefined;
        slope?: number | string | undefined;
        spacing?: number | string | undefined;
        specularConstant?: number | string | undefined;
        specularExponent?: number | string | undefined;
        speed?: number | string | undefined;
        spreadMethod?: string | undefined;
        startOffset?: number | string | undefined;
        stdDeviation?: number | string | undefined;
        stemh?: number | string | undefined;
        stemv?: number | string | undefined;
        stitchTiles?: number | string | undefined;
        stopColor?: string | undefined;
        stopOpacity?: number | string | undefined;
        strikethroughPosition?: number | string | undefined;
        strikethroughThickness?: number | string | undefined;
        string?: number | string | undefined;
        stroke?: string | undefined;
        strokeDasharray?: string | number | undefined;
        strokeDashoffset?: string | number | undefined;
        strokeLinecap?: "butt" | "round" | "square" | "inherit" | undefined;
        strokeLinejoin?: "miter" | "round" | "bevel" | "inherit" | undefined;
        strokeMiterlimit?: number | string | undefined;
        strokeOpacity?: number | string | undefined;
        strokeWidth?: number | string | undefined;
        surfaceScale?: number | string | undefined;
        systemLanguage?: number | string | undefined;
        tableValues?: number | string | undefined;
        targetX?: number | string | undefined;
        targetY?: number | string | undefined;
        textAnchor?: string | undefined;
        textDecoration?: number | string | undefined;
        textLength?: number | string | undefined;
        textRendering?: number | string | undefined;
        to?: number | string | undefined;
        transform?: string | undefined;
        u1?: number | string | undefined;
        u2?: number | string | undefined;
        underlinePosition?: number | string | undefined;
        underlineThickness?: number | string | undefined;
        unicode?: number | string | undefined;
        unicodeBidi?: number | string | undefined;
        unicodeRange?: number | string | undefined;
        unitsPerEm?: number | string | undefined;
        vAlphabetic?: number | string | undefined;
        values?: string | undefined;
        vectorEffect?: number | string | undefined;
        version?: string | undefined;
        vertAdvY?: number | string | undefined;
        vertOriginX?: number | string | undefined;
        vertOriginY?: number | string | undefined;
        vHanging?: number | string | undefined;
        vIdeographic?: number | string | undefined;
        viewBox?: string | undefined;
        viewTarget?: number | string | undefined;
        visibility?: number | string | undefined;
        vMathematical?: number | string | undefined;
        widths?: number | string | undefined;
        wordSpacing?: number | string | undefined;
        writingMode?: number | string | undefined;
        x1?: number | string | undefined;
        x2?: number | string | undefined;
        x?: number | string | undefined;
        xChannelSelector?: string | undefined;
        xHeight?: number | string | undefined;
        xlinkActuate?: string | undefined;
        xlinkArcrole?: string | undefined;
        xlinkHref?: string | undefined;
        xlinkRole?: string | undefined;
        xlinkShow?: string | undefined;
        xlinkTitle?: string | undefined;
        xlinkType?: string | undefined;
        xmlBase?: string | undefined;
        xmlLang?: string | undefined;
        xmlns?: string | undefined;
        xmlnsXlink?: string | undefined;
        xmlSpace?: string | undefined;
        y1?: number | string | undefined;
        y2?: number | string | undefined;
        y?: number | string | undefined;
        yChannelSelector?: string | undefined;
        z?: number | string | undefined;
        zoomAndPan?: string | undefined;
    }

    //
    // React.DOM
    // ----------------------------------------------------------------------

    interface ReactHTML {
        a: DetailedHTMLFactory<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
        abbr: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        address: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        area: DetailedHTMLFactory<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
        article: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        aside: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        audio: DetailedHTMLFactory<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
        b: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        base: DetailedHTMLFactory<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
        bdi: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        bdo: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        big: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        blockquote: DetailedHTMLFactory<BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
        body: DetailedHTMLFactory<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
        br: DetailedHTMLFactory<HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
        button: DetailedHTMLFactory<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
        canvas: DetailedHTMLFactory<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
        caption: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        cite: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        code: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        col: DetailedHTMLFactory<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
        colgroup: DetailedHTMLFactory<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
        data: DetailedHTMLFactory<DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
        datalist: DetailedHTMLFactory<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
        dd: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        del: DetailedHTMLFactory<DelHTMLAttributes<HTMLElement>, HTMLElement>;
        details: DetailedHTMLFactory<DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
        dfn: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        dialog: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        div: DetailedHTMLFactory<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
        dl: DetailedHTMLFactory<HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
        dt: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        em: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        embed: DetailedHTMLFactory<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
        fieldset: DetailedHTMLFactory<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
        figcaption: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        figure: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        footer: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        form: DetailedHTMLFactory<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
        h1: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h2: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h3: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h4: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h5: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h6: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        head: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLHeadElement>;
        header: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        hgroup: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        hr: DetailedHTMLFactory<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
        html: DetailedHTMLFactory<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
        i: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        iframe: DetailedHTMLFactory<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
        img: DetailedHTMLFactory<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
        input: DetailedHTMLFactory<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
        ins: DetailedHTMLFactory<InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
        kbd: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        keygen: DetailedHTMLFactory<KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
        label: DetailedHTMLFactory<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
        legend: DetailedHTMLFactory<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
        li: DetailedHTMLFactory<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
        link: DetailedHTMLFactory<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
        main: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        map: DetailedHTMLFactory<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
        mark: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        menu: DetailedHTMLFactory<MenuHTMLAttributes<HTMLElement>, HTMLElement>;
        menuitem: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        meta: DetailedHTMLFactory<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
        meter: DetailedHTMLFactory<MeterHTMLAttributes<HTMLElement>, HTMLElement>;
        nav: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        noscript: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        object: DetailedHTMLFactory<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
        ol: DetailedHTMLFactory<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
        optgroup: DetailedHTMLFactory<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
        option: DetailedHTMLFactory<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
        output: DetailedHTMLFactory<OutputHTMLAttributes<HTMLElement>, HTMLElement>;
        p: DetailedHTMLFactory<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
        param: DetailedHTMLFactory<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
        picture: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        pre: DetailedHTMLFactory<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
        progress: DetailedHTMLFactory<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
        q: DetailedHTMLFactory<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
        rp: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        rt: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        ruby: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        s: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        samp: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        script: DetailedHTMLFactory<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
        section: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        select: DetailedHTMLFactory<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
        small: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        source: DetailedHTMLFactory<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
        span: DetailedHTMLFactory<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
        strong: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        style: DetailedHTMLFactory<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
        sub: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        summary: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        sup: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        table: DetailedHTMLFactory<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
        template: DetailedHTMLFactory<HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
        tbody: DetailedHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
        td: DetailedHTMLFactory<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
        textarea: DetailedHTMLFactory<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
        tfoot: DetailedHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
        th: DetailedHTMLFactory<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
        thead: DetailedHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
        time: DetailedHTMLFactory<TimeHTMLAttributes<HTMLElement>, HTMLElement>;
        title: DetailedHTMLFactory<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
        tr: DetailedHTMLFactory<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
        track: DetailedHTMLFactory<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
        u: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        ul: DetailedHTMLFactory<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
        "var": DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        video: DetailedHTMLFactory<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
        wbr: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        webview: DetailedHTMLFactory<WebViewHTMLAttributes<HTMLElement>, HTMLElement>;
    }

    interface ReactSVG {
        svg: SVGFactory;
        animate: SVGFactory;
        circle: SVGFactory;
        defs: SVGFactory;
        ellipse: SVGFactory;
        g: SVGFactory;
        image: SVGFactory;
        line: SVGFactory;
        linearGradient: SVGFactory;
        mask: SVGFactory;
        path: SVGFactory;
        pattern: SVGFactory;
        polygon: SVGFactory;
        polyline: SVGFactory;
        radialGradient: SVGFactory;
        rect: SVGFactory;
        stop: SVGFactory;
        symbol: SVGFactory;
        text: SVGFactory;
        tspan: SVGFactory;
        use: SVGFactory;
    }

    interface ReactDOM extends ReactHTML, ReactSVG {}

    //
    // React.PropTypes
    // ----------------------------------------------------------------------

    type Validator<T> = {
        bivarianceHack(object: T, key: string, componentName: string, ...rest: any[]): Error | null;
    }["bivarianceHack"];

    interface Requireable<T> extends Validator<T> {
        isRequired: Validator<T>;
    }

    type ValidationMap<T> = { [K in keyof T]?: Validator<T> };

    interface ReactPropTypes {
        any: Requireable<any>;
        array: Requireable<any>;
        bool: Requireable<any>;
        func: Requireable<any>;
        number: Requireable<any>;
        object: Requireable<any>;
        string: Requireable<any>;
        node: Requireable<any>;
        element: Requireable<any>;
        instanceOf(expectedClass: {}): Requireable<any>;
        oneOf(types: any[]): Requireable<any>;
        oneOfType(types: Array<Validator<any>>): Requireable<any>;
        arrayOf(type: Validator<any>): Requireable<any>;
        objectOf(type: Validator<any>): Requireable<any>;
        shape(type: ValidationMap<any>): Requireable<any>;
    }

    //
    // React.Children
    // ----------------------------------------------------------------------

    interface ReactChildren {
        map<T, C extends ReactElement>(children: C[], fn: (child: C, index: number) => T): T[];
        map<T>(children: ReactNode, fn: (child: ReactChild, index: number) => T): T[];
        forEach(children: ReactNode, fn: (child: ReactChild, index: number) => any): void;
        count(children: ReactNode): number;
        only(children: ReactNode): ReactElement;
        toArray(children: ReactNode): ReactChild[];
    }

    //
    // Browser Interfaces
    // https://github.com/nikeee/2048-typescript/blob/master/2048/js/touch.d.ts
    // ----------------------------------------------------------------------

    interface AbstractView {
        styleMedia: StyleMedia;
        document: Document;
    }

    interface Touch {
        identifier: number;
        target: EventTarget;
        screenX: number;
        screenY: number;
        clientX: number;
        clientY: number;
        pageX: number;
        pageY: number;
    }

    interface TouchList {
        [index: number]: Touch;
        length: number;
        item(index: number): Touch;
        identifiedTouch(identifier: number): Touch;
    }

    namespace JSX {
        interface Element extends GlobalJSXElement {}
        interface ElementClass extends GlobalJSXElementClass {}
        interface ElementAttributesProperty extends GlobalJSXElementAttributesProperty {}
        interface ElementChildrenAttribute extends GlobalJSXElementChildrenAttribute {}

        interface IntrinsicAttributes extends GlobalJSXIntrinsicAttributes {}
        interface IntrinsicClassAttributes<T> extends GlobalJSXIntrinsicClassAttributes<T> {}
        interface IntrinsicElements extends GlobalJSXIntrinsicElements {}
    }
}

declare global {
    /**
     * @deprecated Use `React.JSX` instead of the global `JSX` namespace.
     */
    namespace JSX {
        interface Element extends React.ReactElement {}
        interface ElementClass extends React.Component<any> {
            render(): JSX.Element | null | false;
        }
        interface ElementAttributesProperty {
            props: {};
        }
        interface ElementChildrenAttribute {
            children: {};
        }

        interface IntrinsicAttributes extends React.Attributes {}
        interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}

        interface IntrinsicElements {
            // HTML
            a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
            abbr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            address: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            area: React.DetailedHTMLProps<React.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
            article: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            aside: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            audio: React.DetailedHTMLProps<React.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
            b: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            base: React.DetailedHTMLProps<React.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
            bdi: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            bdo: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            big: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            blockquote: React.DetailedHTMLProps<React.BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
            body: React.DetailedHTMLProps<React.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
            br: React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
            button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
            canvas: React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
            caption: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            cite: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            code: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            col: React.DetailedHTMLProps<React.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
            colgroup: React.DetailedHTMLProps<React.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
            data: React.DetailedHTMLProps<React.DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
            datalist: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
            dd: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            del: React.DetailedHTMLProps<React.DelHTMLAttributes<HTMLElement>, HTMLElement>;
            details: React.DetailedHTMLProps<React.DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
            dfn: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            dialog: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
            dl: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
            dt: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            em: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            embed: React.DetailedHTMLProps<React.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
            fieldset: React.DetailedHTMLProps<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
            figcaption: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            figure: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            footer: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
            h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h5: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h6: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            head: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
            header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            hgroup: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            hr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
            html: React.DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
            i: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            iframe: React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
            img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
            input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
            ins: React.DetailedHTMLProps<React.InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
            kbd: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            keygen: React.DetailedHTMLProps<React.KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
            label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
            legend: React.DetailedHTMLProps<React.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
            li: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
            link: React.DetailedHTMLProps<React.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
            main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            map: React.DetailedHTMLProps<React.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
            mark: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            menu: React.DetailedHTMLProps<React.MenuHTMLAttributes<HTMLElement>, HTMLElement>;
            menuitem: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            meta: React.DetailedHTMLProps<React.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
            meter: React.DetailedHTMLProps<React.MeterHTMLAttributes<HTMLElement>, HTMLElement>;
            nav: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            noindex: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            noscript: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            object: React.DetailedHTMLProps<React.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
            ol: React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
            optgroup: React.DetailedHTMLProps<React.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
            option: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
            output: React.DetailedHTMLProps<React.OutputHTMLAttributes<HTMLElement>, HTMLElement>;
            p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
            param: React.DetailedHTMLProps<React.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
            picture: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            pre: React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
            progress: React.DetailedHTMLProps<React.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
            q: React.DetailedHTMLProps<React.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
            rp: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            rt: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            ruby: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            s: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            samp: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            script: React.DetailedHTMLProps<React.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
            section: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            select: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
            small: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            source: React.DetailedHTMLProps<React.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
            span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
            strong: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            style: React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
            sub: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            summary: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            sup: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            table: React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
            template: React.DetailedHTMLFactory<React.HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
            tbody: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
            td: React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
            textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
            tfoot: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
            th: React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
            thead: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
            time: React.DetailedHTMLProps<React.TimeHTMLAttributes<HTMLElement>, HTMLElement>;
            title: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
            tr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
            track: React.DetailedHTMLProps<React.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
            u: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            ul: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
            "var": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            video: React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
            wbr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            webview: React.DetailedHTMLProps<React.WebViewHTMLAttributes<HTMLElement>, HTMLElement>;

            // SVG
            svg: React.SVGProps<SVGSVGElement>;

            animate: React.SVGProps<SVGElement>; // TODO: It is SVGAnimateElement but is not in TypeScript's lib.dom.d.ts for now.
            animateTransform: React.SVGProps<SVGElement>; // TODO: It is SVGAnimateTransformElement but is not in TypeScript's lib.dom.d.ts for now.
            circle: React.SVGProps<SVGCircleElement>;
            clipPath: React.SVGProps<SVGClipPathElement>;
            defs: React.SVGProps<SVGDefsElement>;
            desc: React.SVGProps<SVGDescElement>;
            ellipse: React.SVGProps<SVGEllipseElement>;
            feBlend: React.SVGProps<SVGFEBlendElement>;
            feColorMatrix: React.SVGProps<SVGFEColorMatrixElement>;
            feComponentTransfer: React.SVGProps<SVGFEComponentTransferElement>;
            feComposite: React.SVGProps<SVGFECompositeElement>;
            feConvolveMatrix: React.SVGProps<SVGFEConvolveMatrixElement>;
            feDiffuseLighting: React.SVGProps<SVGFEDiffuseLightingElement>;
            feDisplacementMap: React.SVGProps<SVGFEDisplacementMapElement>;
            feDistantLight: React.SVGProps<SVGFEDistantLightElement>;
            feFlood: React.SVGProps<SVGFEFloodElement>;
            feFuncA: React.SVGProps<SVGFEFuncAElement>;
            feFuncB: React.SVGProps<SVGFEFuncBElement>;
            feFuncG: React.SVGProps<SVGFEFuncGElement>;
            feFuncR: React.SVGProps<SVGFEFuncRElement>;
            feGaussianBlur: React.SVGProps<SVGFEGaussianBlurElement>;
            feImage: React.SVGProps<SVGFEImageElement>;
            feMerge: React.SVGProps<SVGFEMergeElement>;
            feMergeNode: React.SVGProps<SVGFEMergeNodeElement>;
            feMorphology: React.SVGProps<SVGFEMorphologyElement>;
            feOffset: React.SVGProps<SVGFEOffsetElement>;
            fePointLight: React.SVGProps<SVGFEPointLightElement>;
            feSpecularLighting: React.SVGProps<SVGFESpecularLightingElement>;
            feSpotLight: React.SVGProps<SVGFESpotLightElement>;
            feTile: React.SVGProps<SVGFETileElement>;
            feTurbulence: React.SVGProps<SVGFETurbulenceElement>;
            filter: React.SVGProps<SVGFilterElement>;
            foreignObject: React.SVGProps<SVGForeignObjectElement>;
            g: React.SVGProps<SVGGElement>;
            image: React.SVGProps<SVGImageElement>;
            line: React.SVGLineElementAttributes<SVGLineElement>;
            linearGradient: React.SVGProps<SVGLinearGradientElement>;
            marker: React.SVGProps<SVGMarkerElement>;
            mask: React.SVGProps<SVGMaskElement>;
            metadata: React.SVGProps<SVGMetadataElement>;
            path: React.SVGProps<SVGPathElement>;
            pattern: React.SVGProps<SVGPatternElement>;
            polygon: React.SVGProps<SVGPolygonElement>;
            polyline: React.SVGProps<SVGPolylineElement>;
            radialGradient: React.SVGProps<SVGRadialGradientElement>;
            rect: React.SVGProps<SVGRectElement>;
            stop: React.SVGProps<SVGStopElement>;
            switch: React.SVGProps<SVGSwitchElement>;
            symbol: React.SVGProps<SVGSymbolElement>;
            text: React.SVGTextElementAttributes<SVGTextElement>;
            textPath: React.SVGProps<SVGTextPathElement>;
            tspan: React.SVGProps<SVGTSpanElement>;
            use: React.SVGProps<SVGUseElement>;
            view: React.SVGProps<SVGViewElement>;
        }
    }
}

// React.JSX needs to point to global.JSX to keep global module augmentations intact.
// But we can't access global.JSX so we need to create these aliases instead.
// Once the global JSX namespace will be removed we replace React.JSX with the contents of global.JSX
interface GlobalJSXElement extends JSX.Element {}
interface GlobalJSXElementClass extends JSX.ElementClass {}
interface GlobalJSXElementAttributesProperty extends JSX.ElementAttributesProperty {}
interface GlobalJSXElementChildrenAttribute extends JSX.ElementChildrenAttribute {}

interface GlobalJSXIntrinsicAttributes extends JSX.IntrinsicAttributes {}
interface GlobalJSXIntrinsicClassAttributes<T> extends JSX.IntrinsicClassAttributes<T> {}

interface GlobalJSXIntrinsicElements extends JSX.IntrinsicElements {}
