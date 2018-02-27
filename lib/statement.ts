import * as Parsimmon from 'parsimmon';

import { initialSymbol, moduleName } from './helpers';

export const moduleDeclaration = initialSymbol('module').then(moduleName);
