grammar CPP14;

translationunit
	:	declarationseq?  
	;

primaryexpression
	:	literal 
	|	This 
	|	'('
	expression ')'
	|	identexpression 
	|	lambdaexpression 
	;

idexpression
	:	unqualifiedid 
	|	qualifiedid 
	;

identexpression
	:	unqualifiedid 
	|	qualifiedid 
	;

unqualifiedid
	:	Identifier 
	|	operatorfunctionid 
	|	conversionfunctionid 
	|	literaloperatorid 
	|	'~'
	myclassname 
	|	'~'
	decltypespecifier 
	|	templateid 
	;

qualifiedid
	:	nestednamespecifier Template? unqualifiedid 
	;

nestednamespecifier
	:	'::'
	|	typename '::'
	|	namespacename '::'
	|	decltypespecifier '::'
	|	nestednamespecifier Identifier '::'
	|	nestednamespecifier Template? simpletemplateid '::'
	;

lambdaexpression
	:	lambdaintroducer lambdadeclarator? compoundstatement 
	;

lambdaintroducer
	:	'['
	lambdacapture? ']'
	;

lambdacapture
	:	capturedefault 
	|	capturelist 
	|	capturedefault ','
	capturelist 
	;

capturedefault
	:	'&'
	|	'='
	;

capturelist
	:	capture '...'
	? 
	|	capturelist ','
	capture '...'
	? 
	;

capture
	:	simplecapture 
	|	initcapture 
	;

simplecapture
	:	Identifier 
	|	'&'
	Identifier 
	|	This 
	;

initcapture
	:	Identifier initializer 
	|	'&'
	Identifier initializer 
	;

lambdadeclarator
	:	'('
	parameterdeclarationclause ')'
	Mutable? exceptionspecification? attributespecifierseq? trailingreturntype? 
	;

idexpressionlapper
	:	idexpression 
	;

functioncallexpression
	:	primaryexpression LeftParen initializerlist? RightParen 
	;

postfixexpression
	:	primaryexpression 
	|	functioncallexpression 
	|	postfixexpression LeftBracket assignmentexpression RightBracket 
	|	postfixexpression '['
	bracedinitlist ']'
	|	simpletypespecifier '('
	expressionlist? ')'
	|	typenamespecifier '('
	expressionlist? ')'
	|	simpletypespecifier bracedinitlist 
	|	typenamespecifier bracedinitlist 
	|	postfixexpression Dot Template? idexpressionlapper 
	|	postfixexpression Arrow Template? idexpressionlapper 
	|	postfixexpression Dot pseudodestructorname 
	|	postfixexpression Arrow pseudodestructorname 
	|	postfixexpression PlusPlus 
	|	postfixexpression MinusMinus 
	|	Dynamic_cast '<'
	typeid '>'
	'('
	expression ')'
	|	Static_cast '<'
	typeid '>'
	'('
	expression ')'
	|	Reinterpret_cast '<'
	typeid '>'
	'('
	expression ')'
	|	Const_cast '<'
	typeid '>'
	'('
	expression ')'
	|	Typeid '('
	expression ')'
	|	Typeid '('
	typeid ')'
	;

expressionlist
	:	initializerlist 
	;

pseudodestructorname
	:	nestednamespecifier? typename '::'
	'~'
	typename 
	|	nestednamespecifier Template simpletemplateid '::'
	'~'
	typename 
	|	nestednamespecifier? '~'
	typename 
	|	'~'
	decltypespecifier 
	;

binaryexpression
	:	postfixexpression 
	|	unaryexpression 
	|	newexpression 
	|	deleteexpression 
	;

unaryexpression
	:	PlusPlus castexpression 
	|	MinusMinus castexpression 
	|	unaryoperator castexpression 
	|	Sizeof binaryexpression 
	|	Sizeof '('
	typeidlapper ')'
	|	Sizeof '('
	typeid ')'
	|	Sizeof '...'
	'('
	Identifier ')'
	|	Alignof '('
	typeid ')'
	|	noexceptexpression 
	;

typeidlapper
	:	typeid 
	;

unaryoperator
	:	'|'
	|	'*'
	|	'&'
	|	'+'
	|	'!'
	|	'~'
	|	'-'
	;

newexpression
	:	'::'
	? New newplacement? newtypeid newinitializer? 
	|	'::'
	? New newplacement? '('
	typeid ')'
	newinitializer? 
	;

newplacement
	:	'('
	expressionlist ')'
	;

newtypeid
	:	typespecifierseq newdeclarator? 
	;

newdeclarator
	:	ptroperator newdeclarator? 
	|	noptrnewdeclarator 
	;

noptrnewdeclarator
	:	'['
	expression ']'
	attributespecifierseq? 
	|	noptrnewdeclarator '['
	constantexpression ']'
	attributespecifierseq? 
	;

newinitializer
	:	'('
	expressionlist? ')'
	|	bracedinitlist 
	;

deleteexpression
	:	'::'
	? Delete castexpression 
	|	'::'
	? Delete '['
	']'
	castexpression 
	;

noexceptexpression
	:	Noexcept '('
	expression ')'
	;

castexpression
	:	binaryexpression 
	|	LeftParen typeid RightParen castexpression 
	;

pmexpression
	:	castexpression 
	|	pmexpression DotStar castexpression 
	|	pmexpression ArrowStar castexpression 
	;

multiplicativeexpression
	:	pmexpression 
	|	multiplicativeexpression Star pmexpression 
	|	multiplicativeexpression Div pmexpression 
	|	multiplicativeexpression Mod pmexpression 
	;

additiveexpression
	:	multiplicativeexpression 
	|	additiveexpression Plus multiplicativeexpression 
	|	additiveexpression Minus multiplicativeexpression 
	;

shiftexpression
	:	additiveexpression 
	|	shiftexpression LeftShift additiveexpression 
	|	shiftexpression rightShift additiveexpression 
	;

relationalexpression
	:	shiftexpression 
	|	relationalexpression Less shiftexpression 
	|	relationalexpression Greater shiftexpression 
	|	relationalexpression LessEqual shiftexpression 
	|	relationalexpression GreaterEqual shiftexpression 
	;

equalityexpression
	:	relationalexpression 
	|	equalityexpression Equal relationalexpression 
	|	equalityexpression NotEqual relationalexpression 
	;

andexpression
	:	equalityexpression 
	|	andexpression And equalityexpression 
	;

exclusiveorexpression
	:	andexpression 
	|	exclusiveorexpression Caret andexpression 
	;

inclusiveorexpression
	:	exclusiveorexpression 
	|	inclusiveorexpression Or exclusiveorexpression 
	;

logicalandexpression
	:	inclusiveorexpression 
	|	logicalandexpression AndAnd inclusiveorexpression 
	;

logicalorexpression
	:	logicalandexpression 
	|	logicalorexpression OrOr logicalandexpression 
	;

conditionalexpression
	:	logicalorexpression 
	|	logicalorexpression '?'
	expression ':'
	assignmentexpression 
	;

assignmentexpression
	:	conditionalexpression 
	|	logicalorexpression assignmentoperator initializerclause 
	|	throwexpression 
	;

assignmentoperator
	:	'='
	|	'*='
	|	'/='
	|	'%='
	|	'+='
	|	'-='
	|	rightShiftAssign 
	|	'<<='
	|	'&='
	|	'^='
	|	'|='
	;

expression
	:	assignmentexpression 
	|	expression ','
	assignmentexpression 
	;

constantexpression
	:	conditionalexpression 
	;

statement
	:	labeledstatement 
	|	attributespecifierseq? expressionstatement 
	|	attributespecifierseq? compoundstatement 
	|	attributespecifierseq? selectionstatement 
	|	attributespecifierseq? switchstatement 
	|	attributespecifierseq? iterationstatement 
	|	attributespecifierseq? whilestatement 
	|	attributespecifierseq? dowhilestatement 
	|	attributespecifierseq? jumpstatement 
	|	attributespecifierseq? breakStatement 
	|	attributespecifierseq? continueStatement 
	|	attributespecifierseq? returnStatement 
	|	variabledeclarationstatement 
	|	declarationstatement 
	|	attributespecifierseq? tryblock 
	;

labeledstatement
	:	attributespecifierseq? Identifier ':'
	statement 
	|	attributespecifierseq? Case constantexpression ':'
	statement 
	|	attributespecifierseq? Default ':'
	statement 
	;

expressionstatement
	:	expression? ';'
	;

compoundstatement
	:	'{'
	statementseq? '}'
	;

statementseq
	:	statement statement* 
	;

selectionstatement
	:	If '('
	condition ')'
	statement 
	|	If '('
	condition ')'
	statement Else statement 
	;

switchstatement
	:	Switch '('
	condition ')'
	statement 
	;

condition
	:	expression 
	|	attributespecifierseq? declspecifierseq declarator '='
	initializerclause 
	|	attributespecifierseq? declspecifierseq declarator bracedinitlist 
	;

whilestatement
	:	While '('
	condition ')'
	statement 
	;

dowhilestatement
	:	Do compoundstatement While '('
	expression ')'
	';'
	;

iterationstatement
	:	For '('
	forinitstatement condition? ';'
	expression? ')'
	statement 
	;

enhancedForStatement
	:	For '('
	forrangedeclaration ':'
	forrangeinitializer ')'
	statement 
	;

forinitstatement
	:	expressionstatement 
	|	variabledeclarationstatement 
	|	simpledeclaration 
	;

forrangedeclaration
	:	attributespecifierseq? declspecifierseq declarator 
	;

forrangeinitializer
	:	expression 
	|	bracedinitlist 
	;

jumpstatement
	:	Goto Identifier ';'
	;

breakStatement
	:	Break ';'
	;

continueStatement
	:	Continue ';'
	;

returnStatement
	:	Return expression? ';'
	|	Return bracedinitlist ';'
	;

declarationstatement
	:	simpledeclaration 
	|	blockdeclarationwithoutsimpledeclaration 
	;

declarationseq
	:	declaration 
	|	declarationseq declaration 
	;

myclassbody
	:	memberspecification? 
	;

myclassspecifier
	:	myclasshead '{'
	myclassbody '}'
	';'
	;

myclasshead
	:	classkey attributespecifierseq? nestednamespecifier? classheadname classvirtspecifier? baseclause? 
	|	classkey attributespecifierseq? baseclause? 
	;

declaration
	:	variabledeclarationstatement 
	|	blockdeclaration 
	|	myclassspecifier 
	|	functiondefinition 
	|	templatedeclaration 
	|	explicitinstantiation 
	|	explicitspecialization 
	|	linkagespecification 
	|	namespacedefinition 
	|	emptydeclaration 
	|	attributedeclaration 
	;

blockdeclarationwithoutsimpledeclaration
	:	asmdefinition 
	|	namespacealiasdefinition 
	|	usingdeclaration 
	|	usingdirective 
	|	static_assertdeclaration 
	|	aliasdeclaration 
	|	opaqueenumdeclaration 
	;

blockdeclaration
	:	simpledeclaration 
	|	blockdeclarationwithoutsimpledeclaration 
	;

aliasdeclaration
	:	Using Identifier attributespecifierseq? '='
	typeid ';'
	;

variabledeclarationstatement
	:	variabledeclaration ';'
	;

variabledeclaration
	:	attributespecifierseq? declspecifierseqwithouttype? typespecifier variableDeclaratorList? 
	;

variableDeclaratorList
	:|	variableDeclarator (','
	variableDeclarator )* 
	;

variableDeclarator
	:	ptroperator* declaratorid (LeftBracket Integerliteral? RightBracket )* ('='
	initializerclause )? 
	;

dims
	:	LeftBracket RightBracket 
	;

simpledeclaration
	:	declspecifierseq? initdeclaratorlist? ';'
	|	attributespecifierseq declspecifierseq? initdeclaratorlist ';'
	;

static_assertdeclaration
	:	Static_assert '('
	constantexpression ','
	Stringliteral ')'
	';'
	;

emptydeclaration
	:	';'
	;

attributedeclaration
	:	attributespecifierseq ';'
	;

declspecifier
	:	declspecifierwithouttype 
	|	typespecifier 
	;

declspecifierseq
	:	declspecifier attributespecifierseq? 
	|	declspecifier declspecifierseq 
	;

declspecifierwithouttype
	:	storageclassspecifier 
	|	functionspecifier 
	|	Friend 
	|	Typedef 
	|	Constexpr 
	;

declspecifierseqwithouttype
	:	declspecifierwithouttype attributespecifierseq? 
	|	declspecifierwithouttype declspecifierseq 
	;

storageclassspecifier
	:	Register 
	|	Static 
	|	Thread_local 
	|	Extern 
	|	Mutable 
	;

functionspecifier
	:	Inline 
	|	Virtual 
	|	Explicit 
	;

typedefname
	:	Identifier 
	;

typespecifier
	:	trailingtypespecifier 
	|	myclassspecifier 
	|	enumspecifier 
	;

trailingtypespecifier
	:	simpletypespecifier 
	|	elaboratedtypespecifier 
	|	typenamespecifier 
	|	cvqualifier 
	;

typespecifierseq
	:	typespecifier attributespecifierseq? 
	|	typespecifier typespecifierseq 
	;

trailingtypespecifierseq
	:	trailingtypespecifier attributespecifierseq? 
	|	trailingtypespecifier trailingtypespecifierseq 
	;

simpletypespecifier
	:	nestednamespecifier? typename 
	|	nestednamespecifier Template simpletemplateid 
	|	Char 
	|	Char16 
	|	Char32 
	|	Wchar 
	|	Bool 
	|	Short 
	|	Int 
	|	Long 
	|	Signed 
	|	Unsigned simpletypespecifier? 
	|	Float 
	|	Double 
	|	Void 
	|	Auto 
	|	decltypespecifier 
	|	File 
	;

typename
	:	myclassname 
	|	enumname 
	|	typedefname 
	|	simpletemplateid 
	;

decltypespecifier
	:	Decltype '('
	expression ')'
	|	Decltype '('
	Auto ')'
	;

elaboratedtypespecifier
	:	classkey attributespecifierseq? nestednamespecifier? Identifier 
	|	classkey simpletemplateid 
	|	classkey nestednamespecifier Template? simpletemplateid 
	|	Enum nestednamespecifier? Identifier 
	;

enumname
	:	Identifier 
	;

enumspecifier
	:	enumhead '{'
	enumeratorlist? '}'
	|	enumhead '{'
	enumeratorlist ','
	'}'
	;

enumhead
	:	enumkey attributespecifierseq? Identifier? enumbase? 
	|	enumkey attributespecifierseq? nestednamespecifier Identifier enumbase? 
	;

opaqueenumdeclaration
	:	enumkey attributespecifierseq? Identifier enumbase? ';'
	;

enumkey
	:	Enum 
	|	Enum Class 
	|	Enum Struct 
	;

enumbase
	:	':'
	typespecifierseq 
	;

enumeratorlist
	:	enumeratordefinition 
	|	enumeratorlist ','
	enumeratordefinition 
	;

enumeratordefinition
	:	enumerator 
	|	enumerator '='
	constantexpression 
	;

enumerator
	:	Identifier 
	;

namespacename
	:	originalnamespacename 
	|	namespacealias 
	;

originalnamespacename
	:	Identifier 
	;

namespacedefinition
	:	namednamespacedefinition 
	|	unnamednamespacedefinition 
	;

namednamespacedefinition
	:	originalnamespacedefinition 
	|	extensionnamespacedefinition 
	;

originalnamespacedefinition
	:	Inline? Namespace Identifier '{'
	namespacebody '}'
	;

extensionnamespacedefinition
	:	Inline? Namespace originalnamespacename '{'
	namespacebody '}'
	;

unnamednamespacedefinition
	:	Inline? Namespace '{'
	namespacebody '}'
	;

namespacebody
	:	declarationseq? 
	;

namespacealias
	:	Identifier 
	;

namespacealiasdefinition
	:	Namespace Identifier '='
	qualifiednamespacespecifier ';'
	;

qualifiednamespacespecifier
	:	nestednamespecifier? namespacename 
	;

usingdeclaration
	:	Using Typename? nestednamespecifier unqualifiedid ';'
	|	Using '::'
	unqualifiedid ';'
	;

usingdirective
	:	attributespecifierseq? Using Namespace nestednamespecifier? namespacename ';'
	;

asmdefinition
	:	Asm '('
	Stringliteral ')'
	';'
	;

linkagespecification
	:	Extern Stringliteral '{'
	declarationseq? '}'
	|	Extern Stringliteral declaration 
	;

attributespecifierseq
	:	attributespecifier 
	|	attributespecifierseq attributespecifier 
	;

attributespecifier
	:	'['
	'['
	attributelist ']'
	']'
	|	alignmentspecifier 
	;

alignmentspecifier
	:	Alignas '('
	typeid '...'
	? ')'
	|	Alignas '('
	constantexpression '...'
	? ')'
	;

attributelist
	:	attribute? 
	|	attributelist ','
	attribute? 
	|	attribute '...'
	|	attributelist ','
	attribute '...'
	;

attribute
	:	attributetoken attributeargumentclause? 
	;

attributetoken
	:	Identifier 
	|	attributescopedtoken 
	;

attributescopedtoken
	:	attributenamespace '::'
	Identifier 
	;

attributenamespace
	:	Identifier 
	;

attributeargumentclause
	:	'('
	balancedtokenseq ')'
	;

balancedtokenseq
	:	balancedtoken? 
	|	balancedtokenseq balancedtoken 
	;

balancedtoken
	:	'('
	balancedtokenseq ')'
	|	'['
	balancedtokenseq ']'
	|	'{'
	balancedtokenseq '}'
	;

initdeclaratorlist
	:	initdeclarator (','
	initdeclarator )* 
	;

initdeclarator
	:	declarator initializer? 
	;

declarator
	:	ptrdeclarator 
	|	noptrdeclarator parametersandqualifiers trailingreturntype 
	;

ptrdeclarator
	:	ptroperator* noptrdeclarator 
	;

noptrdeclarator
	:	declaratorid attributespecifierseq? 
	|	noptrdeclarator parametersandqualifiers 
	|	noptrdeclarator '['
	constantexpression? ']'
	attributespecifierseq? 
	|	'('
	ptrdeclarator ')'
	;

parametersandqualifiers
	:	'('
	parameterdeclarationclause ')'
	cvqualifierseq? refqualifier? exceptionspecification? attributespecifierseq? 
	;

trailingreturntype
	:	'->'
	trailingtypespecifierseq abstractdeclarator? 
	;

ptroperator
	:	'*'
	attributespecifierseq? cvqualifierseq? 
	|	'&'
	attributespecifierseq? 
	|	'&&'
	attributespecifierseq? 
	|	nestednamespecifier '*'
	attributespecifierseq? cvqualifierseq? 
	;

cvqualifierseq
	:	cvqualifier cvqualifierseq? 
	;

cvqualifier
	:	Const 
	|	Volatile 
	;

refqualifier
	:	'&'
	|	'&&'
	;

declaratorid
	:	'...'
	? idexpression 
	;

typeid
	:	typespecifierseq abstractdeclarator? 
	;

abstractdeclarator
	:	ptrabstractdeclarator 
	|	noptrabstractdeclarator? parametersandqualifiers trailingreturntype 
	|	abstractpackdeclarator 
	;

ptrabstractdeclarator
	:	noptrabstractdeclarator 
	|	ptroperator ptrabstractdeclarator? 
	;

noptrabstractdeclarator
	:	noptrabstractdeclarator parametersandqualifiers 
	|	parametersandqualifiers 
	|	noptrabstractdeclarator '['
	constantexpression? ']'
	attributespecifierseq? 
	|	'['
	constantexpression? ']'
	attributespecifierseq? 
	|	'('
	ptrabstractdeclarator ')'
	;

abstractpackdeclarator
	:	noptrabstractpackdeclarator 
	|	ptroperator abstractpackdeclarator 
	;

noptrabstractpackdeclarator
	:	noptrabstractpackdeclarator parametersandqualifiers 
	|	noptrabstractpackdeclarator '['
	constantexpression? ']'
	attributespecifierseq? 
	|	'...'
	;

parameterdeclarationclause
	:	parameterdeclarationlist? '...'
	? 
	|	parameterdeclarationlist ','
	'...'
	;

parameterdeclarationlist
	:	parameterdeclaration 
	|	parameterdeclarationlist ','
	parameterdeclaration 
	;

parameterdeclaration
	:	attributespecifierseq? declspecifierseqwithouttype? typespecifier variableDeclaratorList? 
	;

functiondefinition
	:	attributespecifierseq? declspecifierseqwithouttype? functionheader virtspecifierseq? functionbody 
	;

functionheader
	:	typespecifier? functiondeclarator 
	;

functiondeclarator
	:	declaratorid '('
	parameterdeclarationclause ')'
	;

functionbody
	:	ctorinitializer? compoundstatement 
	|	functiontryblock 
	|	'='
	Default ';'
	|	'='
	Delete ';'
	;

initializer
	:	braceorequalinitializer 
	|	'('
	expressionlist ')'
	;

braceorequalinitializer
	:	'='
	initializerclause 
	|	bracedinitlist 
	;

initializerclause
	:	assignmentexpression 
	|	bracedinitlist 
	;

initializerlist
	:	initializerclause (','
	initializerclause )* 
	;

bracedinitlist
	:	'{'
	initializerlist Comma? '}'
	|	'{'
	'}'
	;

myclassname
	:	Identifier 
	|	simpletemplateid 
	;

classspecifier
	:	classhead classbody 
	;

classbody
	:	'{'
	memberspecification? '}'
	;

classhead
	:	classkey attributespecifierseq? nestednamespecifier? classheadname classvirtspecifier? baseclause? 
	|	classkey attributespecifierseq? baseclause? 
	;

classheadname
	:	nestednamespecifier? myclassname 
	;

classvirtspecifier
	:	Final 
	;

classkey
	:	Class 
	|	Struct 
	|	Union 
	;

memberspecification
	:	memberdeclaration memberspecification? 
	|	accessspecifier ':'
	memberspecification? 
	;

memberdeclaration
	:	membervariabledeclarationstatement 
	|	functiondefinition 
	|	usingdeclaration 
	|	static_assertdeclaration 
	|	templatedeclaration 
	|	aliasdeclaration 
	|	emptydeclaration 
	;

membervariabledeclarationstatement
	:	membervariabledeclaration ';'
	;

membervariabledeclaration
	:	attributespecifierseq? declspecifierseqwithouttype? typespecifier ptroperator* memberdeclaratorlist? 
	;

memberdeclaratorlist
	:	memberdeclarator 
	|	memberdeclaratorlist ','
	memberdeclarator 
	;

memberdeclarator
	:	declaratorid virtspecifierseq? purespecifier? 
	|	declaratorid ('='
	initializerclause )? 
	|	declaratorid bracedinitlist? 
	|	Identifier? attributespecifierseq? ':'
	constantexpression 
	;

virtspecifierseq
	:	virtspecifier 
	|	virtspecifierseq virtspecifier 
	;

virtspecifier
	:	Override 
	|	Final 
	;

purespecifier
	:	Assign val = Octalliteral 
	;

baseclause
	:	':'
	basespecifierlist 
	;

basespecifierlist
	:	basespecifier '...'
	? 
	|	basespecifierlist ','
	basespecifier '...'
	? 
	;

basespecifier
	:	attributespecifierseq? basetypespecifier 
	|	attributespecifierseq? Virtual accessspecifier? basetypespecifier 
	|	attributespecifierseq? accessspecifier Virtual? basetypespecifier 
	;

classordecltype
	:	nestednamespecifier? myclassname 
	|	decltypespecifier 
	;

basetypespecifier
	:	classordecltype 
	;

accessspecifier
	:	Private 
	|	Protected 
	|	Public 
	;

conversionfunctionid
	:	Operator conversiontypeid 
	;

conversiontypeid
	:	typespecifierseq conversiondeclarator? 
	;

conversiondeclarator
	:	ptroperator conversiondeclarator? 
	;

ctorinitializer
	:	':'
	meminitializerlist 
	;

meminitializerlist
	:	meminitializer '...'
	? 
	|	meminitializer '...'
	? ','
	meminitializerlist 
	;

meminitializer
	:	meminitializerid '('
	expressionlist? ')'
	|	meminitializerid bracedinitlist 
	;

meminitializerid
	:	classordecltype 
	|	Identifier 
	;

operatorfunctionid
	:	Operator operator 
	;

literaloperatorid
	:	Operator Stringliteral Identifier 
	|	Operator Userdefinedstringliteral 
	;

templatedeclaration
	:	Template '<'
	templateparameterlist '>'
	declaration 
	;

templateparameterlist
	:	templateparameter 
	|	templateparameterlist ','
	templateparameter 
	;

templateparameter
	:	typeparameter 
	|	parameterdeclaration 
	;

typeparameter
	:	Class '...'
	? Identifier? 
	|	Class Identifier? '='
	typeid 
	|	Typename '...'
	? Identifier? 
	|	Typename Identifier? '='
	typeid 
	|	Template '<'
	templateparameterlist '>'
	Class '...'
	? Identifier? 
	|	Template '<'
	templateparameterlist '>'
	Class Identifier? '='
	idexpression 
	;

simpletemplateid
	:	templatename '<'
	templateargumentlist? '>'
	;

templateid
	:	simpletemplateid 
	|	operatorfunctionid '<'
	templateargumentlist? '>'
	|	literaloperatorid '<'
	templateargumentlist? '>'
	;

templatename
	:	Identifier 
	;

templateargumentlist
	:	templateargument '...'
	? 
	|	templateargumentlist ','
	templateargument '...'
	? 
	;

templateargument
	:	constantexpression 
	|	typeid 
	|	idexpression 
	;

typenamespecifier
	:	Typename nestednamespecifier Identifier 
	|	Typename nestednamespecifier Template? simpletemplateid 
	;

explicitinstantiation
	:	Extern? Template declaration 
	;

explicitspecialization
	:	Template '<'
	'>'
	declaration 
	;

tryblock
	:	Try compoundstatement handlerseq 
	;

functiontryblock
	:	Try ctorinitializer? compoundstatement handlerseq 
	;

handlerseq
	:	handler handlerseq? 
	;

handler
	:	Catch '('
	exceptiondeclaration ')'
	compoundstatement 
	;

exceptiondeclaration
	:	attributespecifierseq? typespecifierseq declarator 
	|	attributespecifierseq? typespecifierseq abstractdeclarator? 
	|	'...'
	;

throwexpression
	:	Throw assignmentexpression? 
	;

exceptionspecification
	:	dynamicexceptionspecification 
	|	noexceptspecification 
	;

dynamicexceptionspecification
	:	Throw '('
	typeidlist? ')'
	;

typeidlist
	:	typeid '...'
	? 
	|	typeidlist ','
	typeid '...'
	? 
	;

noexceptspecification
	:	Noexcept '('
	constantexpression ')'
	|	Noexcept 
	;

Directive
	:	'#'
	~[\r\n]*  ->skip
	;

Alignas
	:	'alignas'
	;

Alignof
	:	'alignof'
	;

Asm
	:	'asm'
	;

Auto
	:	'auto'
	;

Bool
	:	'bool'
	;

Break
	:	'break'
	;

Case
	:	'case'
	;

Catch
	:	'catch'
	;

Char
	:	'char'
	;

Char16
	:	'char16_t'
	;

Char32
	:	'char32_t'
	;

Class
	:	'class'
	;

Const
	:	'const'
	;

Constexpr
	:	'constexpr'
	;

Const_cast
	:	'const_cast'
	;

Continue
	:	'continue'
	;

Decltype
	:	'decltype'
	;

Default
	:	'default'
	;

Delete
	:	'delete'
	;

Do
	:	'do'
	;

Double
	:	'double'
	;

File
	:	'FILE'
	;

Dynamic_cast
	:	'dynamic_cast'
	;

Else
	:	'else'
	;

Enum
	:	'enum'
	;

Explicit
	:	'explicit'
	;

Export
	:	'export'
	;

Extern
	:	'extern'
	;

False
	:	'false'
	;

Final
	:	'final'
	;

Float
	:	'float'
	;

For
	:	'for'
	;

Friend
	:	'friend'
	;

Goto
	:	'goto'
	;

If
	:	'if'
	;

Inline
	:	'inline'
	;

Int
	:	'int'
	;

Long
	:	'long'
	;

Mutable
	:	'mutable'
	;

Namespace
	:	'namespace'
	;

New
	:	'new'
	;

Noexcept
	:	'noexcept'
	;

Nullptr
	:	'nullptr'
	;

Operator
	:	'operator'
	;

Override
	:	'override'
	;

Private
	:	'private'
	;

Protected
	:	'protected'
	;

Public
	:	'public'
	;

Register
	:	'register'
	;

Reinterpret_cast
	:	'reinterpret_cast'
	;

Return
	:	'return'
	;

Short
	:	'short'
	;

Signed
	:	'signed'
	;

Sizeof
	:	'sizeof'
	;

Static
	:	'static'
	;

Static_assert
	:	'static_assert'
	;

Static_cast
	:	'static_cast'
	;

Struct
	:	'struct'
	;

Switch
	:	'switch'
	;

Template
	:	'template'
	;

This
	:	'this'
	;

Thread_local
	:	'thread_local'
	;

Throw
	:	'throw'
	;

True
	:	'true'
	;

Try
	:	'try'
	;

Typedef
	:	'typedef'
	;

Typeid
	:	'typeid'
	;

Typename
	:	'typename'
	;

Union
	:	'union'
	;

Unsigned
	:	'unsigned'
	;

Using
	:	'using'
	;

Virtual
	:	'virtual'
	;

Void
	:	'void'
	;

Volatile
	:	'volatile'
	;

Wchar
	:	'wchar_t'
	;

While
	:	'while'
	;

LeftParen
	:	'('
	;

RightParen
	:	')'
	;

LeftBracket
	:	'['
	;

RightBracket
	:	']'
	;

LeftBrace
	:	'{'
	;

RightBrace
	:	'}'
	;

Plus
	:	'+'
	;

Minus
	:	'-'
	;

Star
	:	'*'
	;

Div
	:	'/'
	;

Mod
	:	'%'
	;

Caret
	:	'^'
	;

And
	:	'&'
	;

Or
	:	'|'
	;

Tilde
	:	'~'
	;

Not
	:	'!'
	;

Assign
	:	'='
	;

Less
	:	'<'
	;

Greater
	:	'>'
	;

PlusAssign
	:	'+='
	;

MinusAssign
	:	'-='
	;

StarAssign
	:	'*='
	;

DivAssign
	:	'/='
	;

ModAssign
	:	'%='
	;

XorAssign
	:	'^='
	;

AndAssign
	:	'&='
	;

OrAssign
	:	'|='
	;

LeftShift
	:	'<<'
	;

rightShift
	:	Greater Greater 
	;

LeftShiftAssign
	:	'<<='
	;

rightShiftAssign
	:	Greater Greater Assign 
	;

Equal
	:	'=='
	;

NotEqual
	:	'!='
	;

LessEqual
	:	'<='
	;

GreaterEqual
	:	'>='
	;

AndAnd
	:	'&&'
	;

OrOr
	:	'||'
	;

PlusPlus
	:	'++'
	;

MinusMinus
	:	'--'
	;

Comma
	:	','
	;

ArrowStar
	:	'->*'
	;

Arrow
	:	'->'
	;

Question
	:	'?'
	;

Colon
	:	':'
	;

Doublecolon
	:	'::'
	;

Semi
	:	';'
	;

Dot
	:	'.'
	;

DotStar
	:	'.*'
	;

Ellipsis
	:	'...'
	;

operator
	:	New 
	|	Delete 
	|	New '['
	']'
	|	Delete '['
	']'
	|	'+'
	|	'-'
	|	'*'
	|	'/'
	|	'%'
	|	'^'
	|	'&'
	|	'|'
	|	'~'
	|	'!'
	|	'='
	|	'<'
	|	'>'
	|	'+='
	|	'-='
	|	'*='
	|	'/='
	|	'%='
	|	'^='
	|	'&='
	|	'|='
	|	'<<'
	|	rightShift 
	|	rightShiftAssign 
	|	'<<='
	|	'=='
	|	'!='
	|	'<='
	|	'>='
	|	'&&'
	|	'||'
	|	'++'
	|	'--'
	|	','
	|	'->*'
	|	'->'
	|	'('
	')'
	|	'['
	']'
	;

fragment
Hexquad
	:	HEXADECIMALDIGIT HEXADECIMALDIGIT HEXADECIMALDIGIT HEXADECIMALDIGIT 
	;

fragment
Universalcharactername
	:	'\\u'
	Hexquad 
	|	'\\U'
	Hexquad Hexquad 
	;

Identifier
	:	Identifiernondigit (	Identifiernondigit 
	|	DIGIT 
	)* 
	;

fragment
Identifiernondigit
	:	NONDIGIT 
	|	Universalcharactername 
	;

fragment
NONDIGIT
	:	[a-zA-Z_] 
	;

fragment
DIGIT
	:	[0-9] 
	;

literal
	:	integerliteral 
	|	characterliteral 
	|	floatingliteral 
	|	stringliteral 
	|	booleanliteral 
	|	pointerliteral 
	|	userdefinedliteral 
	;

integerliteral
	:	Integerliteral 
	;

Integerliteral
	:	Decimalliteral Integersuffix? 
	|	Octalliteral Integersuffix? 
	|	Hexadecimalliteral Integersuffix? 
	|	Binaryliteral Integersuffix? 
	;

Decimalliteral
	:	NONZERODIGIT (	'\''
	? DIGIT 
	)* 
	;

Octalliteral
	:	'0'
	(	'\''
	? OCTALDIGIT 
	)* 
	;

Hexadecimalliteral
	:	(	'0x'
	|	'0X'
	) HEXADECIMALDIGIT (	'\''
	? HEXADECIMALDIGIT 
	)* 
	;

Binaryliteral
	:	(	'0b'
	|	'0B'
	) BINARYDIGIT (	'\''
	? BINARYDIGIT 
	)* 
	;

fragment
NONZERODIGIT
	:	[1-9] 
	;

fragment
OCTALDIGIT
	:	[0-7] 
	;

fragment
HEXADECIMALDIGIT
	:	[0-9a-fA-F] 
	;

fragment
BINARYDIGIT
	:	[01] 
	;

Integersuffix
	:	Unsignedsuffix Longsuffix? 
	|	Unsignedsuffix Longlongsuffix? 
	|	Longsuffix Unsignedsuffix? 
	|	Longlongsuffix Unsignedsuffix? 
	;

fragment
Unsignedsuffix
	:	[uU] 
	;

fragment
Longsuffix
	:	[lL] 
	;

fragment
Longlongsuffix
	:	'll'
	|	'LL'
	;

characterliteral
	:	Characterliteral 
	;

Characterliteral
	:	'\''
	Cchar+ '\''
	|	'u'
	'\''
	Cchar+ '\''
	|	'U'
	'\''
	Cchar+ '\''
	|	'L'
	'\''
	Cchar+ '\''
	;

fragment
Cchar
	:	~['\\\r\n] 
	|	Escapesequence 
	|	Universalcharactername 
	;

fragment
Escapesequence
	:	Simpleescapesequence 
	|	Octalescapesequence 
	|	Hexadecimalescapesequence 
	;

fragment
Simpleescapesequence
	:	'\\\''
	|	'\\"'
	|	'\\?'
	|	'\\\\'
	|	'\\a'
	|	'\\b'
	|	'\\f'
	|	'\\n'
	|	'\\r'
	|	'\\t'
	|	'\\v'
	;

fragment
Octalescapesequence
	:	'\\'
	OCTALDIGIT 
	|	'\\'
	OCTALDIGIT OCTALDIGIT 
	|	'\\'
	OCTALDIGIT OCTALDIGIT OCTALDIGIT 
	;

fragment
Hexadecimalescapesequence
	:	'\\x'
	HEXADECIMALDIGIT+ 
	;

floatingliteral
	:	Floatingliteral 
	;

Floatingliteral
	:	Fractionalconstant Exponentpart? Floatingsuffix? 
	|	Digitsequence Exponentpart Floatingsuffix? 
	;

fragment
Fractionalconstant
	:	Digitsequence? '.'
	Digitsequence 
	|	Digitsequence '.'
	;

fragment
Exponentpart
	:	'e'
	SIGN? Digitsequence 
	|	'E'
	SIGN? Digitsequence 
	;

fragment
SIGN
	:	[+-] 
	;

fragment
Digitsequence
	:	DIGIT (	'\''
	? DIGIT 
	)* 
	;

fragment
Floatingsuffix
	:	[flFL] 
	;

stringliteral
	:	Stringliteral 
	;

Stringliteral
	:	Encodingprefix? '"'
	Schar* '"'
	|	Encodingprefix? 'R'
	Rawstring 
	;

fragment
Encodingprefix
	:	'u8'
	|	'u'
	|	'U'
	|	'L'
	;

fragment
Schar
	:	~["\\\r\n] 
	|	Escapesequence 
	|	Universalcharactername 
	;

fragment
Rawstring
	:	'"'
	.* ? '('
	.* ? ')'
	.* ? '"'
	;

booleanliteral
	:	Booleanliteral 
	;

Booleanliteral
	:	False 
	|	True 
	;

pointerliteral
	:	Nullptr 
	;

userdefinedliteral
	:	Userdefinedintegerliteral 
	|	Userdefinedfloatingliteral 
	|	Userdefinedstringliteral 
	|	Userdefinedcharacterliteral 
	;

Userdefinedintegerliteral
	:	Decimalliteral Udsuffix 
	|	Octalliteral Udsuffix 
	|	Hexadecimalliteral Udsuffix 
	|	Binaryliteral Udsuffix 
	;

Userdefinedfloatingliteral
	:	Fractionalconstant Exponentpart? Udsuffix 
	|	Digitsequence Exponentpart Udsuffix 
	;

Userdefinedstringliteral
	:	Stringliteral Udsuffix 
	;

Userdefinedcharacterliteral
	:	Characterliteral Udsuffix 
	;

fragment
Udsuffix
	:	Identifier 
	;

Whitespace
	:	[ \t]+  ->skip
	;

Newline
	:	(	'\r'
	'\n'
	? 
	|	'\n'
	)  ->skip
	;

BlockComment
	:	'/*'
	.* ? '*/'
	 ->skip
	;

LineComment
	:	'//'
	~[\r\n]*  ->skip
	;

