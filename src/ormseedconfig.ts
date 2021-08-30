import ormconfig from '@app/ormconfig';
import * as path from 'path';

const ormseedconfig = {
    ...ormconfig,
    migrations: [
        path.join(__dirname, '/seeds/**/*{.ts, .js}')
    ],
    cli: {
        migrationsDir: 'src/seeds',
    },
};

export default ormseedconfig;