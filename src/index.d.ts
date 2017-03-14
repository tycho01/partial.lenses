declare var L: L.Static;

declare namespace L {
	
	type OpticsProp = string;
	type OpticsIndex = number;
	type OpticsPath = (string | number)[];
	type Optics = OpticsProp | OpticsIndex | OpticsPath;
	
	type Transform = Optics;
	
	type Traversal = Optics;
	
	type Testable = any;
	
	type MabeyData = any | null | undefined;
	type MabeyValue = any | null | undefined;
	
	interface Static {
		
		prop(x: any): OpticsProp | never;
		
		index(x: any): OpticsIndex | never;
		
		compose(...x): OpticsPath | never;
		
		get(optics: Optics, mabeyData: MabeyData): MabeyValue;
		get(optics: Optics): (mabeyData: MabeyData) => MabeyValue;
		
		set<T>(optics: Optics, val: any, mabeyData: T): T;
		set(optics: Optics, val: any): <T>(mabeyData: T) => T;
		set(optics: Optics): {
			<T>(val: any, mabeyData: T): T;
			(val: any): <T>(mabeyData: T) => T;
		};
		
		remove<T>(optics: Optics, mabeyData: T): T;
		remove(optics: Optics): <T>(mabeyData: T) => T;
		
		modify<T>(optics: Optics, fn: (val: any, iOrK?: number | string) => any, mabeyData: T): T;
		modify(optics: Optics, fn: (val: any, iOrK?: number | string) => any): <T>(mabeyData: T) => T;
		modify(optics: Optics): {
			<T>(fn: (val: any, iOrK?: number | string) => any, mabeyData: T): T;	
			(fn: (val: any, iOrK?: number | string) => any): <T>(mabeyData: T) => T;
		};
		
		chain<T>(fn: (val: any, iOrK?: number | string) => Optics, mabeyData: T): T;
		chain(fn: (val: any, iOrK?: number | string) => Optics): <T>(mabeyData: T) => T;
		
		choice(...optics: Optics[]): Optics;
		
		// high-order version of choice, [ mabey call choiceBy (imitate ramda) ]
		choose(fn: (val: any, iOrK?: number | string) => Optics): Optics;
		
		optional: Optics;
		
		when(fn: (val: any, iOrK?: number | string) => Testable): Optics;
		
		zero: Optics;
		
		lazy(fn: (optics: Optics) => Optics): Optics;
		
		log(...labels: any[]): Optics;
		
		toFunction(optics: Optics): Optics;
		
		seq(...optics: Optics[]): Transform;
		
		// concat
		
		// concatAs
		
		all(pred: (val: any, iOrK?: number|string) => Testable, traversal: Traversal, mabeyData: MabeyData): boolean;
		all(pred: (val: any, iOrK?: number|string) => Testable, traversal: Traversal): (mabeyData: MabeyData) => boolean
		all(pred: (val: any, iOrK?: number|string) => Testable): {
			(traversal: Traversal, mabeyData: MabeyData): boolean;
			(traversal: Traversal): (mabeyData: MabeyData) => boolean;
		};
		
		and(traversal: Traversal, mabeyData: MabeyData): boolean;
		and(traversal: Traversal): (mabeyData: MabeyData) => boolean;
		
		any(pred: (val: any, iOrK?: number|string) => Testable, traversal: Traversal, mabeyData: MabeyData): boolean;
		any(pred: (val: any, iOrK?: number|string) => Testable, traversal: Traversal): (mabeyData: MabeyData) => boolean
		any(pred: (val: any, iOrK?: number|string) => Testable): {
			(traversal: Traversal, mabeyData: MabeyData): boolean;
			(traversal: Traversal): (mabeyData: MabeyData) => boolean;
		};
		
		collect(traversal: Traversal, mabeyData: MabeyData): any[];
		collect(traversal: Traversal): (mabeyData: MabeyData) => any[];
		
		collectAs(fn: (val: any, iOrk?: number|string) => any, traversal: Traversal, mabeyData: MabeyData): any[];
		collectAs(fn: (val: any, iOrk?: number|string) => any, traversal: Traversal): (mabeyData: MabeyData) => any[];
		collectAs(fn: (val: any, iOrk?: number|string) => any): {
			(traversal: Traversal, mabeyData: MabeyData): any[];
			(traversal: Traversal): (mabeyData: MabeyData) => any[];
		};
		
		first(traversal: Traversal, mabeyData: MabeyData): MabeyValue;
		first(traversal: Traversal): (mabeydata: MabeyData) => MabeyValue;
		
		firstAs(fn: (mabeyValue: MabeyValue, iOrK?: number|string) => MabeyValue, traversal: Traversal, mabeyData: MabeyData): MabeyValue;
		firstAs(fn: (mabeyValue: MabeyValue, iOrK?: number|string) => MabeyValue, traversal: Traversal): (mabeyData: MabeyData) => MabeyData;
		firstAs(fn: (mabeyValue: MabeyValue, iOrK?: number|string) => MabeyValue): {
			(traversal: Traversal, mabeyData: MabeyData): MabeyValue;
			(traversal: Traversal): (mabeyData: MabeyData) => MabeyValue;
		};
		
		foldl(fn: (val1: MabeyValue, val2: MabeyValue, iOrK?: number|string) => MabeyValue, val: MabeyValue, traversal: Traversal, mabeyData: MabeyData): any;
		foldl(fn: (val1: MabeyValue, val2: MabeyValue, iOrK?: number|string) => MabeyValue, val: MabeyValue, traversal: Traversal): (mabeyData: MabeyData) => any;
		foldl(fn: (val1: MabeyValue, val2: MabeyValue, iOrK?: number|string) => MabeyValue, val: MabeyValue): {
			(traversal: Traversal, mabeyData: MabeyData): any;
			(traversal: Traversal): (mabeyData: MabeyData) => any;
		};
		foldl(fn: (val1: MabeyValue, val2: MabeyValue, iOrK?: number|string) => MabeyValue): {
			(val: MabeyValue, traversal: Traversal, mabeyData: MabeyData): any;
			(val: MabeyValue, traversal: Traversal): (mabeyData: MabeyData) => any;
			(val: MabeyValue): {
				(traversal: Traversal, mabeyData: MabeyData): any;
				(traversal: Traversal): (mabeyData: MabeyData) => any;		
			};
		};
		
		foldr(fn: (val1: MabeyValue, val2: MabeyValue, iOrK?: number|string) => MabeyValue, val: MabeyValue, traversal: Traversal, mabeyData: MabeyData): any;
		foldr(fn: (val1: MabeyValue, val2: MabeyValue, iOrK?: number|string) => MabeyValue, val: MabeyValue, traversal: Traversal): (mabeyData: MabeyData) => any;
		foldr(fn: (val1: MabeyValue, val2: MabeyValue, iOrK?: number|string) => MabeyValue, val: MabeyValue): {
			(traversal: Traversal, mabeyData: MabeyData): any;
			(traversal: Traversal): (mabeyData: MabeyData) => any;
		};
		foldr(fn: (val1: MabeyValue, val2: MabeyValue, iOrK?: number|string) => MabeyValue): {
			(val: MabeyValue, traversal: Traversal, mabeyData: MabeyData): any;
			(val: MabeyValue, traversal: Traversal): (mabeyData: MabeyData) => any;
			(val: MabeyValue): {
				(traversal: Traversal, mabeyData: MabeyData): any;
				(traversal: Traversal): (mabeyData: MabeyData) => any;		
			};
		};
		
		maximum(traversal: Traversal, mabeyData: MabeyData): MabeyValue;
		
		
	}
	
}

export = L;

/*

toFunction(o)
// toFunction(optic) ~> optic

// Operations on optics

modify(o, xi2x, s)
// modify(optic, (maybeValue, index) => maybeValue, maybeData) ~> maybeData

remove(o, s)
// remove(optic, maybeData) ~> maybeData

set(setU)
// set(optic, maybeValue, maybeData) ~> maybeData

// Sequencing

seq()
// seq(...optics) ~> transform

// Nesting

compose()
// compose(...optics) ~> optic

// Querying

chain(xi2yO, xO)
// chain((value, index) => optic, optic) ~> optic

choice(...ls)
// choice(...lenses) ~> optic

choose = xiM2o => (C, xi2yC, x, i) =>
// choose((maybeValue, index) => optic) ~> optic

when = p => (C, xi2yC, x, i) =>
// when((maybeValue, index) => testable) ~> optic

optional
// optional ~> optic

zero(C, xi2yC, x, i)
// zero ~> optic

// Recursing

lazy(o2o)
// lazy(optic => optic) ~> optic

// Debugging

log()
// log(...labels) ~> optic

// Operations on traversals

concatAs
// concatAs((maybeValue, index) => value, monoid, traversal, maybeData) ~> traversal

concat
// concat(monoid, traversal, maybeData) ~> traversal

mergeAs
// mergeAs((maybeValue, index) => value, monoid, traversal, maybeData) ~> traversal

merge
// merge(monoid, traversal, maybeData) ~> traversal

// Folds over traversals

all = pipe2U(mkFirst(x => x ? void 0 : T), not)

and = all(id)

any = pipe2U(mkFirst(x => x ? T : void 0), Boolean)

collectAs
// collectAs((maybeValue, index) => maybeValue, traversal, maybeData) ~> [...values]

collect
// collect(traversal, maybeData) ~> [...values]

firstAs = curry(mkFirst(x => void 0 !== x ? the(x) : x))

first = firstAs(id)

foldl(f, r, t, s)
// foldl((value, maybeValue, index) => value, value, traversal, maybeData) ~> value

foldr(f, r, t, s)
// foldr((value, maybeValue, index) => value, value, traversal, maybeData) ~> value

maximum
// maximum(traversal, maybeData) ~> maybeValue

minimum
// minimum(traversal, maybeData) ~> maybeValue

or = any(id)

product
// product(traversal, maybeData) ~> number

sum
// sum(traversal, maybeData) ~> number

// Creating new traversals

branch(template)
// branch({prop: traversal, ...props}) ~> traversal

// Traversals and combinators

elems(A, xi2yA, xs, _)
// elems ~> traversal

values(A, xi2yA, xs, _)
// values ~> traversal

// Operations on lenses

get
// get(lens, maybeData) ~> maybeValue

// Creating new lenses

lens(get, set) => (F, xi2yF, x, i) =>
// lens((maybeData, index) => maybeValue, (maybeValue, maybeData, index) => maybeData) ~> lens

// Computing derived props

augment(template)
// augment({prop: object => value, ...props}) ~> lens

// Enforcing invariants

defaults(out)
// defaults(valueIn) ~> lens

required(inn)
// required(valueOut) ~> lens

define(v)
// define(value) ~> lens

normalize(xi2x)
// normalize((value, index) => maybeValue) ~> lens

rewrite(yi2y) => (F, xi2yF, x, i) =>
// rewrite((valueOut, index) => maybeValueOut) ~> lens

// Lensing arrays

append = (F, xi2yF, xs, i) =>
// append ~> lens

filter = xi2b => (F, xi2yF, xs, i) => {
// filter((value, index) => testable) ~> lens

find(xi2b)
// find((value, index) => testable) ~> lens

findWith(...ls)
// findWith(...lenses) ~> lens

index
// index(elemIndex) ~> lens

slice(begin, end) => (F, xsi2yF, xs, i) =>
// slice(maybeBegin, maybeEnd) ~> lens

// Lensing objects

prop
// prop(propName) ~> lens

props()
// props(...propNames) ~> lens

removable(...ps) => (F, xi2yF, x, i) =>
// removable(...propNames) ~> lens

// Providing defaults

valueOr = v => (_F, xi2yF, x, i) =>
// valueOr(valueOut) ~> lens

// Adapting to data

orElse
// orElse(backupLens, primaryLens) ~> lens

// Read-only mapping

to
// to((maybeValue, index) => maybeValue) ~> lens

just
// just(maybeValue) ~> lens

// Transforming data

pick(template)
// pick({prop: lens, ...props}) ~> lens

replace(inn, out)
// replace(maybeValueIn, maybeValueOut) ~> lens

// Operations on isomorphisms

getInverse
// getInverse(isomorphism, maybeData) ~> maybeData

// Creating new isomorphisms

iso(bwd, fwd) => (F, xi2yF, x, i) => 
// iso(maybeData => maybeValue, maybeValue => maybeData) ~> isomorphism

// Isomorphisms and combinators

identity = (_F, xi2yF, x, i) => xi2yF(x, i)
// identity ~> isomorphism

inverse = iso => (F, xi2yF, x, i) =>
// index(elemIndex) ~> lens

//*/

