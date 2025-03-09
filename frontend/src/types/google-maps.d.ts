declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
      setZoom(zoom: number): void;
      setMapTypeId(mapTypeId: string): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
      fitBounds(bounds: LatLngBounds, padding?: number | Padding): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
      toJSON(): LatLngLiteral;
      toString(): string;
      equals(other: LatLng): boolean;
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
      getCenter(): LatLng;
      isEmpty(): boolean;
      getSouthWest(): LatLng;
      getNorthEast(): LatLng;
      toJSON(): LatLngBoundsLiteral;
      toString(): string;
      equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng | null;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setTitle(title: string): void;
      setIcon(icon: string | Icon | Symbol): void;
    }

    class Polyline {
      constructor(opts?: PolylineOptions);
      setMap(map: Map | null): void;
      getPath(): MVCArray<LatLng>;
      setPath(path: MVCArray<LatLng> | LatLng[] | LatLngLiteral[]): void;
    }

    class MVCArray<T> {
      constructor(array?: T[]);
      clear(): void;
      getArray(): T[];
      getAt(i: number): T;
      getLength(): number;
      insertAt(i: number, elem: T): void;
      removeAt(i: number): T;
      setAt(i: number, elem: T): void;
      push(elem: T): number;
      pop(): T;
      forEach(callback: (elem: T, i: number) => void): void;
    }

    namespace drawing {
      class DrawingManager {
        constructor(options?: DrawingManagerOptions);
        setMap(map: Map | null): void;
        setDrawingMode(drawingMode: string | null): void;
      }
    }

    class SymbolPath {
      static CIRCLE: number;
      static FORWARD_CLOSED_ARROW: number;
      static FORWARD_OPEN_ARROW: number;
      static BACKWARD_CLOSED_ARROW: number;
      static BACKWARD_OPEN_ARROW: number;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      [key: string]: any;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }

    interface Padding {
      top: number;
      right: number;
      bottom: number;
      left: number;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
      [key: string]: any;
    }

    interface Icon {
      url: string;
      size?: Size;
      origin?: Point;
      anchor?: Point;
      scaledSize?: Size;
      [key: string]: any;
    }

    interface Symbol {
      path: string | number;
      fillColor?: string;
      fillOpacity?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      [key: string]: any;
    }

    interface Size {
      width: number;
      height: number;
      equals(other: Size): boolean;
      toString(): string;
    }

    interface Point {
      x: number;
      y: number;
      equals(other: Point): boolean;
      toString(): string;
    }

    interface PolylineOptions {
      path?: MVCArray<LatLng> | LatLng[] | LatLngLiteral[];
      geodesic?: boolean;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      map?: Map;
      [key: string]: any;
    }

    interface DrawingManagerOptions {
      drawingMode?: string | null;
      drawingControl?: boolean;
      drawingControlOptions?: DrawingControlOptions;
      polylineOptions?: PolylineOptions;
      [key: string]: any;
    }

    interface DrawingControlOptions {
      position?: number;
      drawingModes?: string[];
    }

    interface MapsEventListener {
      remove(): void;
    }

    interface MapMouseEvent {
      latLng?: LatLng;
      [key: string]: any;
    }

    const event: {
      addListener(instance: any, eventName: string, handler: Function): MapsEventListener;
      removeListener(listener: MapsEventListener): void;
    };
  }
} 