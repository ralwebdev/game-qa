import flow, {makeOptions,setup as preflight} from './realistic-user-flow.js';
export const options=makeOptions('smoke');
export const setup=preflight;
export default flow;
