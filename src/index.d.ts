declare var L: L.Static;

declare namespace L {
	
    type Prop = string | number;
	type Path = Prop[];
	type Optic = Prop | Path;
	type Lens = Optic; // ?
	type Transform = Function; // ?
	type Traversal = never; // ?
	type MaybeValue = any | null | undefined;
	type Pred = (maybeValue: MaybeValue, prop?: Prop) => boolean;
    type xi2x = (maybeValue: MaybeValue, index?: Prop) => MaybeValue;
    type FoldFn = FoldFn;

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
		
        count //concatAs(x => void 0 !== x ? 1 : 0, Sum)

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

        or //= any(id)

        product(traversal: Traversal, maybeData: MaybeValue): number;

        sum(traversal: Traversal, maybeData: MaybeValue): number;

        // Creating new traversals

        branch(template)
        // branch({prop: traversal, ...props}) ~> traversal

        // Traversals and combinators

        elems(A, xi2yA, xs, _)
        // elems ~> traversal

        values(A, xi2yA, xs, _)
        // values ~> traversal

        // Operations on lenses

		get(optic: Optic, maybeData: MaybeValue): MaybeValue;
		get(optic: Optic): (maybeData: MaybeValue) => MaybeValue;
		
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

        normalize(xi2x: xi2x): Optic;
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

		index<T extends number>(i: T): T;
		
        slice(begin, end) => (F, xsi2yF, xs, i) =>
        // slice(maybeBegin, maybeEnd) ~> lens

        // Lensing objects

		prop<T extends string>(s: T): T;
		
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
