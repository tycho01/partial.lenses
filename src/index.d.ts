declare var L: L.Static;

declare namespace L {
	
	type OpticsProp = string;
	type OpticsIndex = number;
	type OpticsPath = (string | number)[];
	type Optics = OpticsProp | OpticsIndex | OpticsPath;
	type Transform = Optics;
	type Traversal = Optics;
	type MaybeData = any | null | undefined;
	type MaybeValue = any | null | undefined;
	type Pred = (maybeValue: MaybeValue, iOrK?: number | string) => boolean;

	interface Static {
		
		toFunction(optics: Optics): Optics;
        // toFunction(optic) ~> optic

        // Operations on optics

		modify<T>(optics: Optics, fn: (val: any, iOrK?: number | string) => any, maybeData: T): T;
		modify(optics: Optics, fn: (val: any, iOrK?: number | string) => any): <T>(maybeData: T) => T;
		modify(optics: Optics): {
			<T>(fn: (val: any, iOrK?: number | string) => any, maybeData: T): T;	
			(fn: (val: any, iOrK?: number | string) => any): <T>(maybeData: T) => T;
		};
        // modify(o, xi2x, s)
        // modify(optic, (maybeValue, index) => maybeValue, maybeData) ~> maybeData

		remove<T>(optics: Optics, maybeData: T): T;
		remove(optics: Optics): <T>(maybeData: T) => T;
		
		set<T>(optics: Optics, val: any, maybeData: T): T;
		set(optics: Optics, val: any): <T>(maybeData: T) => T;
		set(optics: Optics): {
			<T>(val: any, maybeData: T): T;
			(val: any): <T>(maybeData: T) => T;
		};
        // set(setU)
        // set(optic, maybeValue, maybeData) ~> maybeData

        // Sequencing

		seq(...optics: Optics[]): Transform;
        // seq(...optics) ~> transform

        // Nesting

		compose(...optics): OpticsPath | never;
        // compose(...optics) ~> optic

        // Querying

		chain<T>(fn: (val: any, iOrK?: number | string) => Optics, maybeData: T): T;
		chain(fn: (val: any, iOrK?: number | string) => Optics): <T>(maybeData: T) => T;
        // chain(xi2yO, xO)
        // chain((value, index) => optic, optic) ~> optic

		choice(...optics: Optics[]): Optics;
		// high-order version of choice, [ maybe call choiceBy (imitate ramda) ]
        // choice(...lenses) ~> optic

		choose(fn: (val: any, iOrK?: number | string) => Optics): Optics;
        // choose = xiM2o => (C, xi2yC, x, i) =>
        // choose((maybeValue, index) => optic) ~> optic

		when(fn: Pred): Optics;
        // when = p => (C, xi2yC, x, i) =>

		optional: Optics;
        // optional ~> optic

		zero: Optics;
        // zero(C, xi2yC, x, i)
        // zero ~> optic

        // Recursing

		lazy(fn: (optics: Optics) => Optics): Optics;
        // lazy(optic => optic) ~> optic

        // Debugging

		log(...labels: any[]): Optics;
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

		all(pred: Pred, traversal: Traversal, maybeData: MaybeData): boolean;
		all(pred: Pred, traversal: Traversal): (maybeData: MaybeData) => boolean
		all(pred: Pred): {
			(traversal: Traversal, maybeData: MaybeData): boolean;
			(traversal: Traversal): (maybeData: MaybeData) => boolean;
		};
		
		and(traversal: Traversal, maybeData: MaybeData): boolean;
		and(traversal: Traversal): (maybeData: MaybeData) => boolean;
		
		any(pred: Pred, traversal: Traversal, maybeData: MaybeData): boolean;
		any(pred: Pred, traversal: Traversal): (maybeData: MaybeData) => boolean
		any(pred: Pred): {
			(traversal: Traversal, maybeData: MaybeData): boolean;
			(traversal: Traversal): (maybeData: MaybeData) => boolean;
		};
		
		collectAs(fn: (val: any, iOrk?: number|string) => any, traversal: Traversal, maybeData: MaybeData): any[];
		collectAs(fn: (val: any, iOrk?: number|string) => any, traversal: Traversal): (maybeData: MaybeData) => any[];
		collectAs(fn: (val: any, iOrk?: number|string) => any): {
			(traversal: Traversal, maybeData: MaybeData): any[];
			(traversal: Traversal): (maybeData: MaybeData) => any[];
		};
		
		collect(traversal: Traversal, maybeData: MaybeData): any[];
		collect(traversal: Traversal): (maybeData: MaybeData) => any[];
		
        count //concatAs(x => void 0 !== x ? 1 : 0, Sum)

		firstAs(fn: (mabeyValue: MaybeValue, iOrK?: number|string) => MaybeValue, traversal: Traversal, maybeData: MaybeData): MaybeValue;
		firstAs(fn: (mabeyValue: MaybeValue, iOrK?: number|string) => MaybeValue, traversal: Traversal): (maybeData: MaybeData) => MaybeData;
		firstAs(fn: (mabeyValue: MaybeValue, iOrK?: number|string) => MaybeValue): {
			(traversal: Traversal, maybeData: MaybeData): MaybeValue;
			(traversal: Traversal): (maybeData: MaybeData) => MaybeValue;
		};
		
		first(traversal: Traversal, maybeData: MaybeData): MaybeValue;
		first(traversal: Traversal): (mabeydata: MaybeData) => MaybeValue;
		
		foldl(fn: (val1: MaybeValue, val2: MaybeValue, iOrK?: number|string) => MaybeValue, val: MaybeValue, traversal: Traversal, maybeData: MaybeData): any;
		foldl(fn: (val1: MaybeValue, val2: MaybeValue, iOrK?: number|string) => MaybeValue, val: MaybeValue, traversal: Traversal): (maybeData: MaybeData) => any;
		foldl(fn: (val1: MaybeValue, val2: MaybeValue, iOrK?: number|string) => MaybeValue, val: MaybeValue): {
			(traversal: Traversal, maybeData: MaybeData): any;
			(traversal: Traversal): (maybeData: MaybeData) => any;
		};
		foldl(fn: (val1: MaybeValue, val2: MaybeValue, iOrK?: number|string) => MaybeValue): {
			(val: MaybeValue, traversal: Traversal, maybeData: MaybeData): any;
			(val: MaybeValue, traversal: Traversal): (maybeData: MaybeData) => any;
			(val: MaybeValue): {
				(traversal: Traversal, maybeData: MaybeData): any;
				(traversal: Traversal): (maybeData: MaybeData) => any;		
			};
		};
		
		foldr(fn: (val1: MaybeValue, val2: MaybeValue, iOrK?: number|string) => MaybeValue, val: MaybeValue, traversal: Traversal, maybeData: MaybeData): any;
		foldr(fn: (val1: MaybeValue, val2: MaybeValue, iOrK?: number|string) => MaybeValue, val: MaybeValue, traversal: Traversal): (maybeData: MaybeData) => any;
		foldr(fn: (val1: MaybeValue, val2: MaybeValue, iOrK?: number|string) => MaybeValue, val: MaybeValue): {
			(traversal: Traversal, maybeData: MaybeData): any;
			(traversal: Traversal): (maybeData: MaybeData) => any;
		};
		foldr(fn: (val1: MaybeValue, val2: MaybeValue, iOrK?: number|string) => MaybeValue): {
			(val: MaybeValue, traversal: Traversal, maybeData: MaybeData): any;
			(val: MaybeValue, traversal: Traversal): (maybeData: MaybeData) => any;
			(val: MaybeValue): {
				(traversal: Traversal, maybeData: MaybeData): any;
				(traversal: Traversal): (maybeData: MaybeData) => any;		
			};
		};

		maximum(traversal: Traversal, maybeData: MaybeData): MaybeValue;
		
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

		get(optics: Optics, maybeData: MaybeData): MaybeValue;
		get(optics: Optics): (maybeData: MaybeData) => MaybeValue;
		
        // Creating new lenses

        lens(get, set) => (F, xi2yF, x, i): //?
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
        // filter(Pred) ~> lens

        // find(Pred) ~> lens

        findWith(...ls)
        // findWith(...lenses) ~> lens

		index(x: any): OpticsIndex | never;
		
        slice(begin, end) => (F, xsi2yF, xs, i) =>
        // slice(maybeBegin, maybeEnd) ~> lens

        // Lensing objects

		prop(s: any): OpticsProp | never;
		
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
		
	}
	
}

export = L;
