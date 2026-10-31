import flow, {makeOptions,setup as preflight} from './realistic-user-flow.js';
export const options=makeOptions('high');
export const setup=preflight;
export default flow;
