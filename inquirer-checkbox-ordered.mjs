import { createPrompt, useState, useKeypress, usePrefix, usePagination, useRef, useMemo, makeTheme, isUpKey, isDownKey, isSpaceKey, isNumberKey, isEnterKey, ValidationError, Separator, } from '@inquirer/core';
import colors from 'yoctocolors-cjs';
import figures from '@inquirer/figures';
import ansiEscapes from 'ansi-escapes';
const checkboxTheme = {
    icon: {
        checked: colors.green(figures.circleFilled),
        unchecked: figures.circle,
        cursor: figures.pointer,
    },
    style: {
        disabledChoice: (text) => colors.dim(`- ${text}`),
        renderSelectedChoices: (selectedChoices) => selectedChoices.map((choice) => choice.name || choice.value).join(', '),
    },
    helpMode: 'auto',
};
function isSelectable(item) {
    return !Separator.isSeparator(item) && !item.disabled;
}
function isChecked(item) {
    return isSelectable(item) && Boolean(item.checked);
}
function toggle(item) {
    return isSelectable(item) ? { ...item, checked: !item.checked, position: null } : item;
}
function setPosition(item, position) {
    return isSelectable(item) ? { ...item, checked: true, position } : item;
}
function check(checked) {
    return function (item) {
        return isSelectable(item) ? { ...item, checked } : item;
    };
}
export default createPrompt((config, done) => {
    console.log('woohoo its a custom prompt')
    const { instructions, pageSize = 7, loop = true, choices, required, validate = () => true, } = config;
    const theme = makeTheme(checkboxTheme, config.theme);
    const prefix = usePrefix({ theme });
    const firstRender = useRef(true);
    const [status, setStatus] = useState('pending');
    const [items, setItems] = useState(choices.map((choice) => ({ ...choice, position: null, })));
    const bounds = useMemo(() => {
        const first = items.findIndex(isSelectable);
        const last = items.findLastIndex(isSelectable);
        if (first < 0) {
            throw new ValidationError('[checkbox prompt] No selectable choices. All choices are disabled.');
        }
        return { first, last };
    }, [items]);
    const [active, setActive] = useState(bounds.first);
    const [showHelpTip, setShowHelpTip] = useState(true);
    const [errorMsg, setError] = useState();
    useKeypress(async (key) => {
        if (isEnterKey(key)) {
            const selection = items.filter(isChecked);
            const isValid = await validate([...selection]);
            if (required && !items.some(isChecked)) {
                setError('At least one choice must be selected');
            }
            else if (isValid === true) {
                setStatus('done');
                done(selection.map((choice) => ({ value: choice.value, position: choice.position })));
            }
            else {
                setError(isValid || 'You must select a valid value');
            }
        }
        else if (isUpKey(key) || isDownKey(key)) {
            if (loop ||
                (isUpKey(key) && active !== bounds.first) ||
                (isDownKey(key) && active !== bounds.last)) {
                const offset = isUpKey(key) ? -1 : 1;
                let next = active;
                do {
                    next = (next + offset + items.length) % items.length;
                } while (!isSelectable(items[next]));
                setActive(next);
            }
        }
        else if (isSpaceKey(key)) {
            setError(undefined);
            setShowHelpTip(false);
            setItems(items.map((choice, i) => (i === active ? toggle(choice) : choice)));
        }
        else if (key.name === 'a') {
            const selectAll = items.some((choice) => isSelectable(choice) && !choice.checked);
            setItems(items.map(check(selectAll)));
        }
        else if (key.name === 'i') {
            setItems(items.map(toggle));
        }
        else if (isNumberKey(key)) {
            // Adjust index to start at 1
            const position = Number(key.name) - 1;
            // console.log('pressed', position, 'key')

            setError(undefined);
            setShowHelpTip(false);
            setItems(items.map((choice, i) => (i === active ? setPosition(choice, Number(key.name)) : choice)));

            // const item = items[position];
            // if (item != null && isSelectable(item)) {
            //     setActive(position);
            //     setItems(items.map((choice, i) => (i === position ? toggle(choice) : choice)));
            // }
        }
    });
    const message = theme.style.message(config.message);
    const page = usePagination({
        items,
        active,
        renderItem({ item, isActive }) {
            if (Separator.isSeparator(item)) {
                return ` ${item.separator}`;
            }
            const line = item.name || item.value;
            if (item.disabled) {
                const disabledLabel = typeof item.disabled === 'string' ? item.disabled : '(disabled)';
                return theme.style.disabledChoice(`${line} ${disabledLabel}`);
            }
            const checkbox = item.checked 
                ? item.position
                    ? item.position
                    : theme.icon.checked 
                : theme.icon.unchecked;
            const color = isActive ? theme.style.highlight : (x) => x;
            const cursor = isActive ? theme.icon.cursor : ' ';
            return color(`${cursor}${checkbox} ${line}`);
        },
        pageSize,
        loop,
    });
    if (status === 'done') {
        const selection = items.filter(isChecked);
        const answer = theme.style.answer(theme.style.renderSelectedChoices(selection, items));
        return `${prefix} ${message} ${answer}`;
    }
    let helpTipTop = '';
    let helpTipBottom = '';
    if (theme.helpMode === 'always' ||
        (theme.helpMode === 'auto' &&
            showHelpTip &&
            (instructions === undefined || instructions))) {
        if (typeof instructions === 'string') {
            helpTipTop = instructions;
        }
        else {
            const keys = [
                `${theme.style.key('space')} to select`,
                `${theme.style.key('a')} to toggle all`,
                `${theme.style.key('i')} to invert selection`,
                `and ${theme.style.key('enter')} to proceed`,
            ];
            helpTipTop = ` (Press ${keys.join(', ')})`;
        }
        if (items.length > pageSize &&
            (theme.helpMode === 'always' ||
                (theme.helpMode === 'auto' && firstRender.current))) {
            helpTipBottom = `\n${theme.style.help('(Use arrow keys to reveal more choices)')}`;
            firstRender.current = false;
        }
    }
    let error = '';
    if (errorMsg) {
        error = `\n${theme.style.error(errorMsg)}`;
    }
    return `${prefix} ${message}${helpTipTop}\n${page}${helpTipBottom}${error}${ansiEscapes.cursorHide}`;
});
export { Separator } from '@inquirer/core';
