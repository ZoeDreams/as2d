import { CanvasInstruction } from "../../src/shared/CanvasInstruction";
import { Buffer } from "../internal/Buffer";
import { LOAD, STORE } from "internal/arraybuffer";
import { DOMMatrix } from "./DOMMatrix";
import { CanvasDirection } from "../../src/shared/CanvasDirection";
import { CanvasPattern } from "./CanvasPattern";
import { CanvasGradient } from "./CanvasGradient";
import { Image } from "./Image";
import { CanvasPatternRepetition } from "../../src/shared/CanvasPatternRepetition";
import { GlobalCompositeOperation } from "../../src/shared/GlobalCompositeOperation";
import { ImageSmoothingQuality } from "../../src/shared/ImageSmoothingQuality";
import { LineCap } from "../../src/shared/LineCap";
import { LineJoin } from "../../src/shared/LineJoin";

//#region EXTERNALS
// @ts-ignore: linked functions can have decorators
@external("__canvas_sys", "createLinearGradient")
declare function createLinearGradient(id: i32, x0: f64, y0: f64, x1: f64, y1: f64): i32;

// @ts-ignore: linked functions can have decorators
@external("__canvas_sys", "createRadialGradient")
declare function createRadialGradient(id: i32, x0: f64, y0: f64, r0: f64, x1: f64, y1: f64, r1: f64): i32;

// @ts-ignore: linked functions can have decorators
@external("__canvas_sys", "createPattern")
declare function createPattern(ctxid: i32, imageid: i32, repetition: CanvasPatternRepetition): i32;
//#endregion EXTERNALS


const enum FillStrokeStyleType {
  String,
  CanvasPattern,
  CanvasGradient,
}

const defaultBlack: string = "#000";
const defaultNone: string = "none";
const defaultFont: string = "10px sans-serif";

//#region ARRAYBUFFERINITIALIZER
/**
 * Utility function for setting the given ArrayBuffer to the identity 2d transform matrix inline.
 *
 * @param ArrayBuffer buff
 */
// @ts-ignore: Decorators are valid here
@inline
function setArrayBufferIdentity(buff: ArrayBuffer): ArrayBuffer {
  STORE<f64>(buff, 0, 1.0);
  STORE<f64>(buff, 1, 0.0);
  STORE<f64>(buff, 2, 0.0);
  STORE<f64>(buff, 3, 1.0);
  STORE<f64>(buff, 4, 0.0);
  STORE<f64>(buff, 5, 0.0);
  return buff;
}

/**
 * Utility function for setting the given ArrayBuffer's first value to the specified value inline.
 *
 * @param ArrayBuffer buff
 * @param T value
 */
// @ts-ignore: Decorators are valid here
@inline
function setArrayBufferValue<T>(buff: ArrayBuffer, value: T): ArrayBuffer {
  STORE<T>(buff, 0, value);
  return buff;
}

/**
 * Utility function for setting the given ArrayBuffer's first value to the specified value inline.
 *
 * @param ArrayBuffer buff
 * @param T value
 */
// @ts-ignore: Decorators are valid here
@inline
function setArrayBufferValue2<T>(buff: ArrayBuffer, a: T, b: T): ArrayBuffer {
  STORE<T>(buff, 0, a);
  STORE<T>(buff, 1, b);
  return buff;
}
//#endregion ARRAYBUFFERINITIALIZER

/**
 * An AssemblyScript virtual representation of an actual CanvasRenderingContext2D Object. The
 * CanvasRenderingContext2D interface, part of the Canvas API, provides the 2D rendering context
 * for the drawing surface of a <canvas> element. It is used for drawing shapes, text, images, and
 * other objects.
 */
@sealed
export class CanvasRenderingContext2D extends Buffer<CanvasInstruction> {
  /**
   * The component's external object id. It initializes to -1, which will never be an actual object
   * id externally. If it actually returns -1, it will cause the host to error saying it cannot
   * find the specified canvas context.
   */
  private id: i32 = -1;

  /**
   * The virutal stack index offset that keeps track of the number of `save()` and `restore()`
   * stack states.
   */
  private _stackOffset: u8 = <u8>0;

  //#region CREATELINEARGRADIENT
  /**
   * The CanvasRenderingContext2D.createLinearGradient() method of the Canvas 2D API creates a
   * gradient along the line connecting two given coordinates.
   *
   * @param {f64} x0 - A float number representing the first x coordinate point of the gradient.
   * @param {f64} y0 - A float number representing the first y coordinate point of the gradient.
   * @param {f64} x1 - A float number representing the second x coordinate point of the gradient.
   * @param {f64} y1 - A float number representing the second y coordinate point of the gradient.
   */
  public createLinearGradient(x0: f64, y0: f64, x1: f64, y1: f64): CanvasGradient {
    var id: i32 = createLinearGradient(this.id, x0, y0, x1, y1);
    var result: CanvasGradient = new CanvasGradient();
    store<i32>(changetype<usize>(result) + offsetof<CanvasGradient>("id"), id);
    return result;
  }
  //#endregion CREATELINEARGRADIENT

  //#region CREATERADIALGRADIENT
  /**
   * The CanvasRenderingContext2D.createRadialGradient() method of the Canvas 2D API creates a
   * radial gradient using the size and coordinates of two circles.
   *
   * @param {f64} x0 - The x-axis coordinate of the start circle.
   * @param {f64} y0 - The y-axis coordinate of the start circle.
   * @param {f64} r0 - The radius of the start circle. Must be non-negative and finite.
   * @param {f64} x1 - The x-axis coordinate of the end circle.
   * @param {f64} y1 - The y-axis coordinate of the end circle.
   * @param {f64} r1 - The radius of the end circle. Must be non-negative and finite.
   */
  public createRadialGradient(x0: f64, y0: f64, r0: f64, x1: f64, y1: f64, r1: f64): CanvasGradient {
    var id: i32 = createRadialGradient(this.id, x0, y0, r0, x1, y1, r1);
    var result: CanvasGradient = new CanvasGradient();
    store<i32>(changetype<usize>(result) + offsetof<CanvasGradient>("id"), id);
    return result;
  }
  //#endregion CREATERADIALGRADIENT

  //#region TRANSFORM
  /**
   * An ArrayBuffer that contains 256 sets of transforms. Each transform value is a set of 6 numbers
   * stored in a repeated pattern of [a0, b0, c0, d0, e0, f0, a1, b1, c1, d1, e1, f1, ...].
   */
  private _transformStack: ArrayBuffer = setArrayBufferIdentity(new ArrayBuffer(0xFF * sizeof<f64>() * 6));

  /**
   * An ArrayBuffer that contains a single transform value that represents the last transform
   * written by a `setTransform()` operation
   */
  private _transformCurrent: ArrayBuffer = setArrayBufferIdentity(new ArrayBuffer(sizeof<f64>() * 6));

  /**
   * An operation that generates a DOMMatrix reflecting the current transform on the `_transformStack
   */
  @inline
  private _getTransform(): DOMMatrix {
    var result: DOMMatrix = new DOMMatrix();
    var index: i32 = 6 * <i32>this._stackOffset;
    var stack: ArrayBuffer = this._transformStack;
    result.m11 = LOAD<f64>(stack, index);
    result.m12 = LOAD<f64>(stack, index + 1);
    result.m21 = LOAD<f64>(stack, index + 2);
    result.m22 = LOAD<f64>(stack, index + 3);
    result.m41 = LOAD<f64>(stack, index + 4);
    result.m42 = LOAD<f64>(stack, index + 5);
    return result;
  }

  /**
   * An operation that sets the current transform on the `_transformStack` to the specified
   * DOMMatrix values.
   *
   * @param {f64} a - The a property of the transform matrix.
   * @param {f64} b - The b property of the transform matrix.
   * @param {f64} c - The c property of the transform matrix.
   * @param {f64} d - The d property of the transform matrix.
   * @param {f64} e - The e property of the transform matrix.
   * @param {f64} f - The f property of the transform matrix.
   */
  @inline
  private _setTransform(a: f64, b: f64, c: f64, d: f64, e: f64, f: f64): void {
    var index: i32 = 6 * <i32>this._stackOffset;
    var stack: ArrayBuffer = this._transformStack;
    STORE<f64>(stack, index, a);
    STORE<f64>(stack, index + 1, b);
    STORE<f64>(stack, index + 2, c);
    STORE<f64>(stack, index + 3, d);
    STORE<f64>(stack, index + 4, e);
    STORE<f64>(stack, index + 5, f);
  }

  /**
   * The CanvasRenderingContext2D.currentTransform property of the Canvas 2D API returns or sets a
   * DOMMatrix (current specification) object for the current transformation matrix
  */
  public get currentTransform(): DOMMatrix {
    return this._getTransform();
  }

  public set currentTransform(value: DOMMatrix) {
    this._setTransform(value.m11, value.m12, value.m21, value.m22, value.m41, value.m42);
  }

  /**
   * The CanvasRenderingContext2D.getTransform() method of the Canvas 2D API gets the current
   * transformation matrix, and returns a DOMMatrix
   */
  public getTransform(): DOMMatrix {
    return this._getTransform();
  }

  /**
   * An internal function that writes the current transform value on the _transformStack to the
   * buffer if it currently does not match the last written transform.
   */
  private _updateTransform(): void {
    var index: i32 = this._stackOffset * 6;
    var stack: ArrayBuffer = this._transformStack;
    var a = LOAD<f64>(stack, index);
    var b = LOAD<f64>(stack, index + 1);
    var c = LOAD<f64>(stack, index + 2);
    var d = LOAD<f64>(stack, index + 3);
    var e = LOAD<f64>(stack, index + 4);
    var f = LOAD<f64>(stack, index + 5);

    var current: ArrayBuffer = this._transformCurrent;
    if ( a != LOAD<f64>(current, 0)
      || b != LOAD<f64>(current, 1)
      || c != LOAD<f64>(current, 2)
      || d != LOAD<f64>(current, 3)
      || e != LOAD<f64>(current, 4)
      || f != LOAD<f64>(current, 5)) {
      this._writeSix(CanvasInstruction.SetTransform, a, b, c, d, e, f);
      STORE<f64>(current, 0, a);
      STORE<f64>(current, 1, b);
      STORE<f64>(current, 2, c);
      STORE<f64>(current, 3, d);
      STORE<f64>(current, 4, e);
      STORE<f64>(current, 5, f);
    }
  }
  //#endregion TRANSFORM

  //#region DIRECTION
  /**
   * An ArrayBuffer that contains 256 sets of CanvasDirection values, stored as `i32` values
   */
  private _directionStack: ArrayBuffer
    = setArrayBufferValue<CanvasDirection>(new ArrayBuffer(0xFF * 4), CanvasDirection.inherit);

  /**
   * A private member that contains a single CanvasDirection value that represents the last
   * CanvasDirection value written by a drawing operation
   */
  private _currentDirection: CanvasDirection = CanvasDirection.inherit;

  /**
   * The CanvasRenderingContext2D.direction property of the Canvas 2D API specifies the current text
   * direction used to draw text
   */
  public get direction(): CanvasDirection {
    return LOAD<CanvasDirection>(this._directionStack, <i32>this._stackOffset);
  }

  public set direction(value: CanvasDirection) {
    STORE<CanvasDirection>(this._directionStack, <i32>this._stackOffset, value);
  }

  /**
   * An internal function that writes the current CanvasDirection value on the _directionStack to
   * the buffer if it currently does not match the last written CanvasDirection.
   */
  @inline
  private _updateDirection(): void {
    var value: CanvasDirection = LOAD<CanvasDirection>(this._directionStack, <i32>this._stackOffset);
    if (value != this._currentDirection) {
      this._currentDirection = value;
      this._writeOne(CanvasInstruction.Direction, <f64>value);
    }
  }
  //#endregion DIRECTION

  //#region FILLSTYLE
  /**
   * An ArrayBuffer that contains 256 sets of 2 i32 values. For each fillStyle, if the fillStyle is
   * a string, the second i32 value will be a pointer, otherwise, it's a `usize` representing the
   * style's external objectID.
   */
  private _fillStyleStack: ArrayBuffer = setArrayBufferValue2<usize>(
    new ArrayBuffer(0xFF * sizeof<usize>() * 2),
    <usize>FillStrokeStyleType.String,
    changetype<usize>(defaultBlack),
  );

  /**
   * A private member that contains a single StrokeFillStyleType value that represents the last
   * fillStyle value written by a drawing operation
   */
  private _currentFillStyleType: FillStrokeStyleType = FillStrokeStyleType.String;

  /**
   * A private member that contains a single pointer or id value that represents the last
   * fillStyle value written by a drawing operation
   */
  private _currentFillStyleValue: usize = changetype<usize>(defaultBlack);

  /**
   * The CanvasRenderingContext2D.fillStyle property of the Canvas 2D API specifies the current text
   * representing a CSS Color
   */
  public get fillStyle(): string | null {
    var index: i32 = this._stackOffset * 2;
    var fillStyleType: FillStrokeStyleType = <FillStrokeStyleType>LOAD<usize>(
      this._fillStyleStack,
      index,
    );
    if (fillStyleType == FillStrokeStyleType.String, "current fillStyle is not a string") {
      return changetype<string>(LOAD<usize>(this._fillStyleStack, index + 1));
    }
    return null;
  }

  public set fillStyle(value: string | null) {
    if (value == null) value = defaultBlack;
    var index: i32 = this._stackOffset * 2;
    var buff: ArrayBuffer = this._fillStyleStack;
    STORE<usize>(buff, index, <usize>FillStrokeStyleType.String);
    STORE<usize>(buff, index + 1, changetype<usize>(value));
  }

  /**
   * An internal function that writes the current fillStyle value on the _fillStyleStack to the
   * buffer if it currently does not match the last written fillStyle.
   */
  @inline
  private _updateFillStyle(): void {
    var buff: ArrayBuffer = this._fillStyleStack;
    var index: i32 = <i32>this._stackOffset * 2;
    var styleType: FillStrokeStyleType = <FillStrokeStyleType>LOAD<usize>(buff, index);
    var value: usize = LOAD<usize>(buff, index + 1);
    if (styleType != this._currentFillStyleType || value != this._currentFillStyleValue) {
      var inst: CanvasInstruction;
      if (styleType == FillStrokeStyleType.String) inst = CanvasInstruction.FillStyle;
      else if (styleType == FillStrokeStyleType.CanvasGradient) inst = CanvasInstruction.FillGradient;
      else inst = CanvasInstruction.FillPattern;
      this._writeOne(inst, <f64>value);
    }
  }
  //#endregion FILLSTYLE

  //#region FILLPATTERN
  /**
   * The CanvasRenderingContext2D.fillPattern property of the Canvas 2D API specifies the current
   * fillStyle pattern
   */
  public get fillPattern(): CanvasPattern | null {
    var index: i32 = this._stackOffset * 2;
    var buff: ArrayBuffer = this._fillStyleStack;
    var fillStyleType: FillStrokeStyleType = <FillStrokeStyleType>LOAD<i32>(
      buff,
      index,
    );

    if (fillStyleType == FillStrokeStyleType.CanvasPattern) {
      var result: CanvasPattern = new CanvasPattern();
      store<i32>(
        changetype<usize>(result) + offsetof<CanvasPattern>("id"),
        LOAD<i32>(buff, index + 1),
      );
      return result;
    }

    return null;
  }

  public set fillPattern(value: CanvasPattern | null) {
    if (value == null) {
      this.fillStyle = defaultBlack;
      return;
    }
    var index: i32 = this._stackOffset * 2;
    var buff: ArrayBuffer = this._fillStyleStack;
    STORE<i32>(buff, index, FillStrokeStyleType.CanvasPattern);
    STORE<i32>(buff, index + 1, load<i32>(changetype<usize>(value) + offsetof<CanvasPattern>("id")));
  }
  //#endregion FILLPATTERN

  //#region FILLGRADIENT
  /**
   * The CanvasRenderingContext2D.fillGradient property of the Canvas 2D API specifies the current
   * fillStyle gradient
   */
  public get fillGradient(): CanvasGradient | null {
    var index: i32 = this._stackOffset * 2;
    var buff: ArrayBuffer = this._fillStyleStack;
    var fillStyleType: FillStrokeStyleType = <FillStrokeStyleType>LOAD<i32>(
      buff,
      index,
    );
    if (fillStyleType == FillStrokeStyleType.CanvasGradient) {
      var result: CanvasGradient = new CanvasGradient();
      store<i32>(
        changetype<usize>(result) + offsetof<CanvasGradient>("id"),
        LOAD<i32>(buff, index + 1),
      );
      return result;
    }

    return null;
  }

  public set fillGradient(value: CanvasGradient | null) {
    if (value == null) {
      this.fillStyle = defaultBlack;
      return;
    }
    var index: i32 = this._stackOffset * 2;
    var buff: ArrayBuffer = this._fillStyleStack;
    STORE<i32>(buff, index, FillStrokeStyleType.CanvasGradient);
    STORE<i32>(buff, index + 1, load<i32>(changetype<usize>(value) + offsetof<CanvasGradient>("id")));
  }
  //#endregion FILLGRADIENT

  //#region CREATEPATTERN
  /**
   * The CanvasRenderingContext2D.createPattern() method of the Canvas 2D API creates a pattern
   * using the specified image and repetition.
   *
   * @param {Image} img - A CanvasImageSource to be used as the pattern's Image.
   * @param {CanvasPatternRepetition} repetition - An enum value indicating how to repeat the pattern's image.
   */
  public createPattern(img: Image, repetition: CanvasPatternRepetition): CanvasPattern {
    var result = new CanvasPattern();
    var id: i32 = load<i32>(changetype<usize>(img) + offsetof<Image>("_id"));
    store<i32>(changetype<usize>(result) + offsetof<CanvasPattern>("id"), createPattern(this.id, id, repetition));
    return result;
  }
  //#endregion CREATEPATTERN

  //#region FILTER
  /**
   * An ArrayBuffer that contains 256 sets of string pointer values.
   */
  private _filterStack: ArrayBuffer = setArrayBufferValue(
    new ArrayBuffer(0xFF * sizeof<usize>()),
    changetype<usize>(defaultNone),
  );

  /**
   * A private member that contains a single string value that represents the last
   * filter value written by a drawing operation.
   */
  private _currentFilter: string = defaultNone;

  /**
   * The CanvasRenderingContext2D.filter property of the Canvas 2D API provides filter effects such
   * as blurring and grayscaling. It is similar to the CSS filter property and accepts the same
   * values.
   */
  public get filter(): string {
    return changetype<string>(LOAD<usize>(this._filterStack, <i32>this._stackOffset));
  }

  public set filter(value: string) {
    STORE<usize>(this._filterStack, <i32>this._stackOffset, changetype<usize>(value));
  }

  /**
   * An internal function that writes the current filter value on the _filterStack if it currently
   * does not match the last written filter string value to the buffer using write_one.
   */
  @inline
  private _updateFilter(): void {
    var value: string = changetype<string>(LOAD<usize>(this._filterStack, <i32>this._stackOffset));
    if (value != this._currentFilter) {
      this._currentFilter = value;
      this._writeOne(CanvasInstruction.Filter, changetype<usize>(value));
    }
  }
  //#endregion FILTER

  //#region FONT
  /**
   * An ArrayBuffer that contains 256 sets of string pointer values.
   */
  private _fontStack: ArrayBuffer = setArrayBufferValue(
    new ArrayBuffer(0xFF * sizeof<usize>()),
    changetype<usize>(defaultFont),
  );

  /**
   * A private member that contains a single string value that represents the last
   * font value written by a drawing operation.
   */
  private _currentFont: string = defaultFont;

  /**
   * The CanvasRenderingContext2D.font property of the Canvas 2D API specifies the current text
   * style to use when drawing text. This string uses the same syntax as the CSS font specifier.
   */
  public get font(): string {
    return changetype<string>(LOAD<usize>(this._fontStack, <i32>this._stackOffset));
  }

  public set font(value: string) {
    STORE<usize>(this._fontStack, <i32>this._stackOffset, changetype<usize>(value));
  }

  /**
   * An internal function that writes the current font value on the _fontStack to the buffer if it
   * currently does not match the last written font string value.
   */
  @inline
  private _updateFont(): void {
    var value: string = changetype<string>(LOAD<usize>(this._fontStack, <i32>this._stackOffset));
    if (value != this._currentFont) {
      this._currentFont = value;
      this._writeOne(CanvasInstruction.Font, changetype<usize>(value));
    }
  }
  //#endregion FONT

  //#region GLOBALALPHA
  /**
   * An ArrayBuffer that contains 256 sets of f64 values.
   */
  private _globalAlphaStack: ArrayBuffer = setArrayBufferValue(
    new ArrayBuffer(0xFF * sizeof<f64>()),
    1.0,
  );

  /**
   * A private member that contains a single float value that represents the last globalAlpha value
   * written by a drawing operation.
   */
  private _currentGlobalAlpha: f64 = 1.0;

  /**
   * The CanvasRenderingContext2D.globalAlpha property of the Canvas 2D API specifies the alpha
   * (transparency) value that is applied to shapes and images before they are drawn onto the
   * canvas.
   */
  public get globalAlpha(): f64 {
    return changetype<f64>(LOAD<usize>(this._globalAlphaStack, <i32>this._stackOffset));
  }

  public set globalAlpha(value: f64) {
    if (value != value) return;
    STORE<f64>(this._globalAlphaStack, <i32>this._stackOffset, min<f64>(1.0, max<f64>(value, 0.0)));
  }

  /**
   * An internal function that writes the current globalAlpha value on the _globalAlphaStack to the
   * buffer if it currently does not match the last written globalAlpha value.
   */
  @inline
  private _updateGlobalAlpha(): void {
    var value: f64 = LOAD<f64>(this._globalAlphaStack, <i32>this._stackOffset);
    if (value != this._currentGlobalAlpha) {
      this._currentGlobalAlpha = value;
      this._writeOne(CanvasInstruction.GlobalAlpha, value);
    }
  }
  //#endregion GLOBALALPHA

  //#region GLOBALCOMPOSITEOPERATION
  /**
   * An ArrayBuffer that contains 256 sets of GlobalCompositeOperation values.
   */
  private _globalCompositeOperationStack: ArrayBuffer = setArrayBufferValue<GlobalCompositeOperation>(
    new ArrayBuffer(0xFF * sizeof<GlobalCompositeOperation>()),
    GlobalCompositeOperation.source_over,
  );

  /**
   * A private member that contains a single GlobalCompositeOperation value that represents the last
   * globalCompositeOperation value written by a drawing operation.
   */
  private _currentGlobalCompositeOperation: GlobalCompositeOperation = GlobalCompositeOperation.source_over;

  /**
   * The CanvasRenderingContext2D.globalCompositeOperation property of the Canvas 2D API sets the
   * type of compositing operation to apply when drawing new shapes.
   */
  public get globalCompositeOperation(): GlobalCompositeOperation {
    return LOAD<GlobalCompositeOperation>(this._globalCompositeOperationStack, <i32>this._stackOffset);
  }

  public set globalCompositeOperation(value: GlobalCompositeOperation) {
    STORE<GlobalCompositeOperation>(this._globalCompositeOperationStack, <i32>this._stackOffset, value);
  }

  /**
   * An internal function that writes the current globalCompositeOperation value on the
   * _globalCompositeOperationStack to the buffer if it currently does not match the last written
   * globalCompositeOperation value.
   */
  @inline
  private _updateGlobalCompositeOperation(): void {
    var value: GlobalCompositeOperation = LOAD<GlobalCompositeOperation>(
      this._globalCompositeOperationStack,
      <i32>this._stackOffset,
    );
    if (value != this._currentGlobalCompositeOperation) {
      this._currentGlobalCompositeOperation = value;
      this._writeOne(CanvasInstruction.GlobalCompositeOperation, <f64>value);
    }
  }
  //#endregion GLOBALCOMPOSITEOPERATION

  //#region IMAGESMOOTHINGENABLED
  /**
   * An ArrayBuffer that contains 256 sets of bool values.
   */
  private _imageSmoothingEnabledStack: ArrayBuffer = setArrayBufferValue<bool>(
    new ArrayBuffer(0xFF * sizeof<bool>()),
    true,
  );

  /**
   * A private member that contains a single bool value that represents the last
   * imageSmoothingEnabled value written by a drawing operation.
   */
  private _currentImageSmoothingEnabled: bool = true;

  /**
   * The imageSmoothingEnabled property of the CanvasRenderingContext2D interface, part of the
   * Canvas API, determines whether scaled images are smoothed (true, default) or not (false). On
   * getting the imageSmoothingEnabled property, the last value it was set to is returned.
   */
  public get imageSmoothingEnabled(): bool {
    return LOAD<bool>(this._imageSmoothingEnabledStack, <i32>this._stackOffset);
  }

  public set imageSmoothingEnabled(value: bool) {
    STORE<bool>(this._imageSmoothingEnabledStack, <i32>this._stackOffset, value);
  }

  /**
   * An internal function that writes the current imageSmoothingEnabled value on the
   * _imageSmoothingEnabledStack to the buffer if it currently does not match the last written
   * imageSmoothingEnabled value.
   */
  @inline
  private _updateImageSmoothingEnabled(): void {
    var value: bool = LOAD<bool>(this._imageSmoothingEnabledStack, <i32>this._stackOffset);
    if (value != this._currentImageSmoothingEnabled) {
      this._currentImageSmoothingEnabled = value;
      this._writeOne(CanvasInstruction.ImageSmoothingEnabled, value ? 1.0 : 0.0);
    }
  }
  //#endregion IMAGESMOOTHINGENABLED

  //#region IMAGESMOOTHINGQUALITY
  /**
   * An ArrayBuffer that contains 256 sets of ImageSmoothingQuality values.
   */
  private _imageSmoothingQualityStack: ArrayBuffer = setArrayBufferValue<ImageSmoothingQuality>(
    new ArrayBuffer(0xFF * sizeof<ImageSmoothingQuality>()),
    ImageSmoothingQuality.low,
  );

  /**
   * A private member that contains a single ImageSmoothingQuality value that represents the last
   * imageSmoothingQuality value written by a drawing operation.
   */
  private _currentImageSmoothingQuality: ImageSmoothingQuality = ImageSmoothingQuality.low;

  /**
   * The imageSmoothingQuality property of the CanvasRenderingContext2D interface, part of the
   * Canvas API, lets you set the quality of image smoothing.
   */
  public get imageSmoothingQuality(): ImageSmoothingQuality {
    return LOAD<ImageSmoothingQuality>(this._imageSmoothingQualityStack, <i32>this._stackOffset);
  }

  public set imageSmoothingQuality(value: ImageSmoothingQuality) {
    STORE<ImageSmoothingQuality>(this._imageSmoothingQualityStack, <i32>this._stackOffset, value);
  }

  /**
   * An internal function that writes the current imageSmoothingQuality value on the
   * _imageSmoothingQualityStack to the buffer if it currently does not match the last written
   * imageSmoothingQuality value, and imageSmoothingEnabled is true.
   */
  @inline
  private _updateImageSmoothingQuality(): void {
    if (LOAD<bool>(this._imageSmoothingEnabledStack, <i32>this._stackOffset)) {
      var value: ImageSmoothingQuality = LOAD<ImageSmoothingQuality>(
        this._imageSmoothingQualityStack,
        <i32>this._stackOffset,
      );
      if (value != this._currentImageSmoothingQuality) {
        this._currentImageSmoothingQuality = value;
        this._writeOne(CanvasInstruction.ImageSmoothingQuality, <f64>value);
      }
    }
  }
  //#endregion IMAGESMOOTHINGQUALITY

  //#region LINECAP
  /**
   * An ArrayBuffer that contains 256 sets of LineCap values.
   */
  private _lineCapStack: ArrayBuffer = setArrayBufferValue<LineCap>(
    new ArrayBuffer(0xFF * sizeof<LineCap>()),
    LineCap.butt,
  );

  /**
   * A private member that contains a single LineCap value that represents the last
   * lineCap value written by a drawing operation.
   */
  private _currentLineCap: LineCap = LineCap.butt;

  /**
   * The CanvasRenderingContext2D.lineCap property of the Canvas 2D API determines the shape used
   * to draw the end points of lines.
   */
  public get lineCap(): LineCap {
    return LOAD<LineCap>(this._lineCapStack, <i32>this._stackOffset);
  }

  public set lineCap(value: LineCap) {
    STORE<LineCap>(this._lineCapStack, <i32>this._stackOffset, value);
  }

  /**
   * An internal function that writes the current lineCap value on the _lineCapStack to the buffer
   * if it currently does not match the last written lineCap value.
   */
  @inline
  private _updateLineCap(): void {
    var value: LineCap = LOAD<LineCap>(
      this._lineCapStack,
      <i32>this._stackOffset,
    );
    if (value != this._currentLineCap) {
      this._currentLineCap = value;
      this._writeOne(CanvasInstruction.LineCap, <f64>value);
    }
  }
  //#endregion LINECAP

  //#region LINEDASHOFFSET
  /**
   * An ArrayBuffer that contains 256 sets of f64 values.
   */
  private _lineDashOffsetStack: ArrayBuffer = setArrayBufferValue(
    new ArrayBuffer(0xFF * sizeof<f64>()),
    0.0,
  );

  /**
   * A private member that contains a single float value that represents the last lineDashOffset value
   * written by a drawing operation.
   */
  private _currentLineDashOffset: f64 = 0.0;

  /**
   * The CanvasRenderingContext2D.lineDashOffset property of the Canvas 2D API sets the line dash
   * offset, or "phase."
   */
  public get lineDashOffset(): f64 {
    return changetype<f64>(LOAD<usize>(this._lineDashOffsetStack, <i32>this._stackOffset));
  }

  public set lineDashOffset(value: f64) {
    if (value != value) return;
    STORE<f64>(this._lineDashOffsetStack, <i32>this._stackOffset, value);
  }

  /**
   * An internal function that writes the current lineDashOffset value on the _lineDashOffsetStack
   * to the buffer if it currently does not match the last written lineDashOffset value.
   */
  @inline
  private _updateLineDashOffset(): void {
    var value: f64 = LOAD<f64>(this._lineDashOffsetStack, <i32>this._stackOffset);
    if (value != this._currentLineDashOffset) {
      this._currentLineDashOffset = value;
      this._writeOne(CanvasInstruction.LineDashOffset, value);
    }
  }
  //#endregion LINEDASHOFFSET

  //#region LINEJOIN
  /**
   * An ArrayBuffer that contains 256 sets of LineJoin values.
   */
  private _lineJoinStack: ArrayBuffer = setArrayBufferValue<LineJoin>(
    new ArrayBuffer(0xFF * sizeof<LineJoin>()),
    LineJoin.miter,
  );

  /**
   * A private member that contains a single LineJoin value that represents the last
   * lineJoin value written by a drawing operation.
   */
  private _currentLineJoin: LineJoin = LineJoin.miter;

  /**
   * The CanvasRenderingContext2D.lineJoin property of the Canvas 2D API determines the shape used
   * to join two line segments where they meet.
   *
   * This property has no effect wherever two connected segments have the same direction, because
   * no joining area will be added in this case. Degenerate segments with a length of zero (i.e.,
   * with all endpoints and control points at the exact same position) are also ignored.
   */
  public get lineJoin(): LineJoin {
    return LOAD<LineJoin>(this._lineJoinStack, <i32>this._stackOffset);
  }

  public set lineJoin(value: LineJoin) {
    STORE<LineJoin>(this._lineJoinStack, <i32>this._stackOffset, value);
  }

  /**
   * An internal function that writes the current lineJoin value on the  _lineJoinStack if it
   * currently does not match the last written lineJoin value.
   */
  @inline
  private _updateLineJoin(): void {
    var value: LineJoin = LOAD<LineJoin>(
      this._lineJoinStack,
      <i32>this._stackOffset,
    );
    if (value != this._currentLineJoin) {
      this._currentLineJoin = value;
      this._writeOne(CanvasInstruction.LineJoin, <f64>value);
    }
  }
  //#endregion

  //#region LINEWIDTH
  /**
   * An ArrayBuffer that contains 256 sets of f64 values.
   */
  private _lineWidthStack: ArrayBuffer = setArrayBufferValue(
    new ArrayBuffer(0xFF * sizeof<f64>()),
    1.0,
  );

  /**
   * A private member that contains a single float value that represents the last lineWidth value
   * written by a drawing operation.
   */
  private _currentLineWidth: f64 = 1.0;

  /**
   * The CanvasRenderingContext2D.lineWidth property of the Canvas 2D API sets the line dash
   * offset, or "phase."
   */
  public get lineWidth(): f64 {
    return changetype<f64>(LOAD<usize>(this._lineWidthStack, <i32>this._stackOffset));
  }

  public set lineWidth(value: f64) {
    STORE<f64>(this._lineWidthStack, <i32>this._stackOffset, value);
  }

  /**
   * An internal function that writes the current lineWidth value on the _lineWidthStack to the
   * buffer if it currently does not match the last written lineWidth value.
   */
  @inline
  private _updateLineWidth(): void {
    var value: f64 = LOAD<f64>(this._lineWidthStack, <i32>this._stackOffset);
    if (value != this._currentLineWidth) {
      this._currentLineWidth = value;
      this._writeOne(CanvasInstruction.LineWidth, value);
    }
  }
  //#endregion

  //#region MITERLIMIT
  /**
   * An ArrayBuffer that contains 256 sets of f64 values.
   */
  private _miterLimitStack: ArrayBuffer = setArrayBufferValue(
    new ArrayBuffer(0xFF * sizeof<f64>()),
    10.0,
  );

  /**
   * A private member that contains a single float value that represents the last miterLimit value
   * written by a drawing operation.
   */
  private _currentMiterLimit: f64 = 10.0;

  /**
   * The CanvasRenderingContext2D.miterLimit property of the Canvas 2D API sets the miter limit
   * ratio. It establishes a limit on the miter when two lines join at a sharp angle, to let you
   * control how thick the junction becomes.
   */
  public get miterLimit(): f64 {
    return changetype<f64>(LOAD<usize>(this._miterLimitStack, <i32>this._stackOffset));
  }

  public set miterLimit(value: f64) {
    STORE<f64>(this._miterLimitStack, <i32>this._stackOffset, value);
  }

  /**
   * An internal function that writes the current miterLimit value on the _miterLimitStack to the
   * buffer if it currently does not match the last written miterLimit value.
   */
  @inline
  private _updateMiterLimit(): void {
    var value: f64 = LOAD<f64>(this._miterLimitStack, <i32>this._stackOffset);
    if (value != this._currentMiterLimit) {
      this._currentMiterLimit = value;
      this._writeOne(CanvasInstruction.MiterLimit, value);
    }
  }
  //#endregion MITERLIMIT
}
