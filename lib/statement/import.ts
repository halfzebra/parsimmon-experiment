import Parsimmon from 'parsimmon';
import { initialSymbol, moduleName, symbol, upName } from '../helpers';
import { moduleExports } from './moduleExports';

export const importStatement = Parsimmon.seq(
  initialSymbol('import').then(moduleName),
  symbol('as')
    .then(upName)
    .fallback('Nothing'),
  symbol('exposing')
    .then(moduleExports)
    .fallback('Nothing')
).desc('Import Statement');
