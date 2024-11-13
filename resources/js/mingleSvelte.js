import { mount } from 'svelte';

const defaultOptions = {
    autoMount: true,
    createComponent: false,
};

const createComponent = (mingleId, wireId, component, options = defaultOptions) => {
    const el = document.getElementById(mingleId);
    const wire = window.Livewire.find(wireId);

    if (!el) {
        return;
    }

    if (el.__svelte_app__) {
        return;
    }

    let mingleData = {};
    if (el.dataset.mingleData) {
        mingleData = JSON.parse(el.dataset.mingleData);
    }

    let mingleBoot = {};
    if (el.dataset.mingleBoot) {
        mingleBoot = JSON.parse(el.dataset.mingleBoot);
    }

    let props = {};

    if (!mingleBoot.stopHydrateData === true) {
        props = {
            wire,
            wireId,
            mingleData,
        };
    }

    const optionsForMount = {
        target: el,
        props: props,
    };

    const exports = mount(component, optionsForMount);

    el.__svelte_app__ = exports;

    return {
        exports,
        node: el,
        mingleData,
    };
};

const registerSvelteMingle = (name, component, options = defaultOptions) => {
    return new Promise((resolve, reject) => {
        window.Mingle = window.Mingle || {
            Elements: {},
        };

        window.Mingle.Elements[name] = {
            boot(mingleId, wireId) {
                try {
                    const result = createComponent(mingleId, wireId, component, options);
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error('Component creation failed'));
                    }
                } catch (error) {
                    reject(error);
                }
            },
        };
    });
};

const createMingle = (name, useCreateComponent) => {
    return new Promise((resolve, reject) => {
        window.Mingle = window.Mingle || {
            Elements: {},
        };

        window.Mingle.Elements[name] = {
            boot(mingleId, wireId) {
                try {
                    const el = document.getElementById(mingleId);
                    const wire = window.Livewire.find(wireId);

                    let mingleData = {};

                    if (el.dataset.mingleData) {
                        mingleData = JSON.parse(el.dataset.mingleData);
                    }

                    const props = {
                        wire,
                        wireId,
                        mingleData,
                    };

                    const result = useCreateComponent({
                        mount,
                        props,
                        el,
                        wire,
                        mingleId,
                        wireId,
                        mingleData,
                    });

                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error('Component creation failed'));
                    }
                } catch (error) {
                    reject(error);
                }
            },
        };
    });
};

export { createMingle };

export default registerSvelteMingle;
