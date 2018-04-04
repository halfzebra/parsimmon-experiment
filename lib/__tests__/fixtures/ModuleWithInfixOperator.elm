module ModuleWithInfixOperator exposing (..)

(=>) : a -> b -> (a,b)
(=>) =
  (,)

infixl 9 =>
