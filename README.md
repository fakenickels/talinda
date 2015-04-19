# talinda
Analisador de expressões logicas e gerador de tabela-da-verdade.
[Acessar](http://talinda.meteor.com).

Legenda para o uso dos operadores:

-  Conectivo disjunção: OU
-  Conectivo conjunção: E
-  Conectivo disjunção exclusiva: XOU
-  Conectivo condicional: ->
-  Conectivo bicondicional: <->
-  Conectivo negação conjunção: ~E
-  Conectivo negação disjunção: ~OU
-  Negação: ~ (é só botar o til na frente da letra)

## Issues
Bugs para serem resolvidos:

- Os conectivos TEM que serem digitados em maiúsculo e as proposições em minúsculo, se fizer ao contrário, o código implode e se cria um buraco negro (a implementação do fallback virá, eu prometo);

- Ainda não faz precedencia dos operadores. Exemplo:
  - a E b E c -> d E f, tem que ser feita como (a e B e c) -> (d E F) ou ele vai resolver*c -> d* antes de *d E f*.

## Pull requests
Pull requests sao muito bem-vindo, no entanto, antes de dar pull rode o JSCS
para manter o styleguide do codigo e crie um novo branch com seu nome de usuario
como prefixo. Exemplo: *grsabreu-iss23*, *aipapai-styles*.
