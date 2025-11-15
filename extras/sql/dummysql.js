
import { hash as _hash } from 'bcrypt';
const saltrounds = 10;
const password = '123456'; // dummy pass

_hash(password, saltrounds, function(err, hash) {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Hash: ", hash);
});