declare var L: L.Static;

declare namespace L {
	
    type Prop = string | number;
	type Path = Prop[];
	type Optic = Prop | Path | Lens;
	// type Lens = Optic; // ?
	type Transform = Function; // ?
	type Traversal = never; // ?
	type MaybeValue = any | null | undefined;
	type Testable = any | null | undefined;
	type Pred = (maybeValue: MaybeValue, prop?: Prop) => boolean;
    type xi2x = (maybeValue: MaybeValue, index?: Prop) => MaybeValue;
    type FoldFn = (val1: MaybeValue, val2: MaybeValue, iOrK?: Prop) => MaybeValue;
    
    // lens
    type Setter = (maybeValue: MaybeValue, prop?: Prop) => MaybeValue;
    type Getter = (maybeValue: MaybeValue, maybeData: MaybeValue, prop?: Prop) => MaybeValue; // maybeData 跟 prop 的顺序换一下的话就跟 Array.prototype.map( (val, idx, origin) => any ); 的 mapFn 类似了。
    type Lens = Setter | Getter;

	interface Static {
		
		toFunction(optic: Optic): Optic;
        // toFunction(optic) ~> optic
        // isomorphisms and lenses:
        // (Functor c, (Maybe a, Index) -> c b, Maybe s, Index) -> c t
        // traversals:
        // (Applicative c, (Maybe a, Index) -> c b, Maybe s, Index) -> c t
        // transforms:
        // (Monad c, (Maybe a, Index) -> c b, Maybe s, Index) -> c t

        // Operations on optics

		modify<T>(optic: Optic, fn: xi2x, maybeData: T): T;
		modify(optic: Optic, fn: xi2x): <T>(maybeData: T) => T;
		modify(optic: Optic): {
			<T>(fn: xi2x, maybeData: T): T;	
			(fn: xi2x): <T>(maybeData: T) => T;
		};

		remove<T>(optic: Optic, maybeData: T): T;
		remove(optic: Optic): <T>(maybeData: T) => T;
		
		set<T>(optic: Optic, val: any, maybeData: T): T;
		set(optic: Optic, val: any): <T>(maybeData: T) => T;
		set(optic: Optic): {
			<T>(val: any, maybeData: T): T;
			(val: any): <T>(maybeData: T) => T;
		};
        // set(setU)
        // set(optic, maybeValue, maybeData) ~> maybeData

        // Sequencing

		seq(...optics: Optic[]): Transform;
        // seq(...optics) ~> transform

        // Nesting

		compose(...optics): Path | never;
        // compose(...optics) ~> optic

        // Querying

		chain<T>(fn: (val: any, prop?: Prop) => Optic, maybeData: T): T;
		chain(fn: (val: any, prop?: Prop) => Optic): <T>(maybeData: T) => T;
        // chain(xi2yO, xO)
        // chain((value, index) => optic, optic) ~> optic

		choice(...optics: Optic[]): Optic;
		// high-order version of choice, [ maybe call choiceBy (imitate ramda) ]
        // choice(...lenses) ~> optic

		choose(fn: (val: any, prop?: Prop) => Optic): Optic;
        // choose = xiM2o => (C, xi2yC, x, i) =>
        // choose((maybeValue, index) => optic) ~> optic

		when(fn: Pred): Optic;
        // when = p => (C, xi2yC, x, i) =>

		optional: Optic;
        // optional ~> optic

		zero: Optic;
        // zero(C, xi2yC, x, i)
        // zero ~> optic

        // Recursing

		lazy(fn: (optic: Optic) => Optic): Optic;
        // lazy(optic => optic) ~> optic

        // Debugging

		log(...labels: any[]): Optic;
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

		all(pred: Pred, traversal: Traversal, maybeData: MaybeValue): boolean;
		all(pred: Pred, traversal: Traversal): (maybeData: MaybeValue) => boolean
		all(pred: Pred): {
			(traversal: Traversal, maybeData: MaybeValue): boolean;
			(traversal: Traversal): (maybeData: MaybeValue) => boolean;
		};
		
		and(traversal: Traversal, maybeData: MaybeValue): boolean;
		and(traversal: Traversal): (maybeData: MaybeValue) => boolean;
		
		any(pred: Pred, traversal: Traversal, maybeData: MaybeValue): boolean;
		any(pred: Pred, traversal: Traversal): (maybeData: MaybeValue) => boolean
		any(pred: Pred): {
			(traversal: Traversal, maybeData: MaybeValue): boolean;
			(traversal: Traversal): (maybeData: MaybeValue) => boolean;
		};
		
		collectAs(fn: (val: any, prop?: Prop) => any, traversal: Traversal, maybeData: MaybeValue): any[];
		collectAs(fn: (val: any, prop?: Prop) => any, traversal: Traversal): (maybeData: MaybeValue) => any[];
		collectAs(fn: (val: any, prop?: Prop) => any): {
			(traversal: Traversal, maybeData: MaybeValue): any[];
			(traversal: Traversal): (maybeData: MaybeValue) => any[];
		};
		
		collect(traversal: Traversal, maybeData: MaybeValue): any[];
		collect(traversal: Traversal): (maybeData: MaybeValue) => any[];
		
        count(traversal: Traversal, maybeData: MaybeValue): MaybeValue;

		firstAs(fn: (maybeValue: MaybeValue, prop?: Prop) => MaybeValue, traversal: Traversal, maybeData: MaybeValue): MaybeValue;
		firstAs(fn: (maybeValue: MaybeValue, prop?: Prop) => MaybeValue, traversal: Traversal): (maybeData: MaybeValue) => MaybeValue;
		firstAs(fn: (maybeValue: MaybeValue, prop?: Prop) => MaybeValue): {
			(traversal: Traversal, maybeData: MaybeValue): MaybeValue;
			(traversal: Traversal): (maybeData: MaybeValue) => MaybeValue;
		};
		
		first(traversal: Traversal, maybeData: MaybeValue): MaybeValue;
		first(traversal: Traversal): (mabeydata: MaybeValue) => MaybeValue;
		
		foldl(fn: FoldFn, val: MaybeValue, traversal: Traversal, maybeData: MaybeValue): any;
		foldl(fn: FoldFn, val: MaybeValue, traversal: Traversal): (maybeData: MaybeValue) => any;
		foldl(fn: FoldFn, val: MaybeValue): {
			(traversal: Traversal, maybeData: MaybeValue): any;
			(traversal: Traversal): (maybeData: MaybeValue) => any;
		};
		foldl(fn: FoldFn): {
			(val: MaybeValue, traversal: Traversal, maybeData: MaybeValue): any;
			(val: MaybeValue, traversal: Traversal): (maybeData: MaybeValue) => any;
			(val: MaybeValue): {
				(traversal: Traversal, maybeData: MaybeValue): any;
				(traversal: Traversal): (maybeData: MaybeValue) => any;		
			};
		};
		
		foldr(fn: FoldFn, val: MaybeValue, traversal: Traversal, maybeData: MaybeValue): any;
		foldr(fn: FoldFn, val: MaybeValue, traversal: Traversal): (maybeData: MaybeValue) => any;
		foldr(fn: FoldFn, val: MaybeValue): {
			(traversal: Traversal, maybeData: MaybeValue): any;
			(traversal: Traversal): (maybeData: MaybeValue) => any;
		};
		foldr(fn: FoldFn): {
			(val: MaybeValue, traversal: Traversal, maybeData: MaybeValue): any;
			(val: MaybeValue, traversal: Traversal): (maybeData: MaybeValue) => any;
			(val: MaybeValue): {
				(traversal: Traversal, maybeData: MaybeValue): any;
				(traversal: Traversal): (maybeData: MaybeValue) => any;		
			};
		};

		maximum(traversal: Traversal, maybeData: MaybeValue): MaybeValue;
		
        minimum(traversal: Traversal, maybeData: MaybeValue): MaybeValue;

        or(traversal: Traversal, maybeData: MaybeValue): boolean;

        product(traversal: Traversal, maybeData: MaybeValue): number;

        sum(traversal: Traversal, maybeData: MaybeValue): number;

        // Creating new traversals

        branch(template: {[K: string]: Optic}): Optic;
        // branch({prop: traversal, ...props}) ~> traversal

        // Traversals and combinators

        // elems(A, xi2yA, xs, _)
        elems: Traversal;

        values: Traversal;
        // values ~> traversal

        // Operations on lenses

		get(optic: Optic, maybeData: MaybeValue): MaybeValue;
		get(optic: Optic): (maybeData: MaybeValue) => MaybeValue;
		
        // Creating new lenses

        lens(setter: Setter, getter: Getter): Lens;
        // lens((maybeData, index) => maybeValue, (maybeValue, maybeData, index) => maybeData) ~> lens

        // Computing derived props

        augment(template: {[K: string|number]: Function}): Lens;
        // augment({prop: object => value, ...props}) ~> lens

        // Enforcing invariants

        defaults(out: any): Lens;
        // defaults(valueIn) ~> lens

        required(inn: any): Lens;
        // required(valueOut) ~> lens

        define(v: any): Lens;
        // define(value) ~> lens

        normalize(xi2x: xi2x): Lens;
        // normalize((value, index) => maybeValue) ~> lens

        rewrite(xi2x: xi2x): Lens;
        // rewrite((valueOut, index) => maybeValueOut) ~> lens

        // Lensing arrays

        // append = (F, xi2yF, xs, i) =>
        append: Lens;

        // filter = xi2b => (F, xi2yF, xs, i) => 
        filter(pred: (maybeValue: MaybeValue, iOrK?: Prop) => Testable): Lens;

        // find(Pred) ~> lens

        findWith(...ls)
        // findWith(...lenses) ~> lens

		index<T extends number>(i: T): T;
		
        slice(begin: Prop, end: Prop): Lens;
        // slice(maybeBegin, maybeEnd) ~> lens

        // Lensing objects

		prop<T extends string>(s: T): T;
		
        props(...ps: Prop[]): Lens;
        // props(...propNames) ~> lens

        removable(...ps: Prop[]): Lens;
        // removable(...propNames) ~> lens

        // Providing defaults

        valueOr(out: any): Lens;
        // valueOr(valueOut) ~> lens

        // Adapting to data

        orElse(backupLens: Lens, primaryLens: Lens): Lens;
        // orElse(backupLens, primaryLens) ~> lens

        // Read-only mapping

        to(xi2x: xi2x): Lens;
        // to((maybeValue, index) => maybeValue) ~> lens

        just(maybeValue: MaybeValue): Lens;
        // just(maybeValue) ~> lens

        // Transforming data

        pick(template: {[k: Prop]: Prop}): Lens;
        // pick({prop: lens, ...props}) ~> lens

        replace(inn: MaybeValue, out: MaybeValue): Lens;
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
