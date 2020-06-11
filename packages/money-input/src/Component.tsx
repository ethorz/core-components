import cn from 'classnames';
import React, { useState, useEffect } from 'react';
import { Input, InputProps } from '@alfalab/core-components-input';

import { CURRENCY_CODES } from './utils/currencyCodes';

import { getFormatedValue, getAmountValueFromStr, formatAmount } from './utils';
import styles from './index.module.css';

type AmountType = {
    /** Сумма в минорных единицах */
    value: number;
    /** Валюта */
    currency: string;
    /** Минорные единицы */
    minorUnits: number;
};

export type MoneyInputProps = Omit<InputProps, 'label' | 'onChange' | 'rightAddons'> & {
    /**
     * Денежное значение
     */
    amount?: AmountType;

    /**
     * Label для input
     */
    label?: string;

    /**
     * Дополнительный класс
     */
    className?: string;

    /**
     * Обработчик события изменения значения
     */
    onChange?: (
        e: React.ChangeEvent<HTMLInputElement>,
        payload: { amount: AmountType; value: string },
    ) => void;

    /**
     * Идентификатор для систем автоматизированного тестирования
     */
    dataTestId?: string;
};

export const MoneyInput: React.FC<MoneyInputProps> = ({
    amount = {
        value: 0,
        minorUnits: 100,
        currency: 'RUR',
    },
    label = 'Сумма',
    className,
    dataTestId,
    onChange,
    ...restProps
}: MoneyInputProps) => {
    const { value, minorUnits, currency } = amount;
    const [inputValue, setInputValue] = useState<string>(value === 0 ? '' : value.toString());
    const currencySymbol = CURRENCY_CODES[currency];

    useEffect(() => {
        const currentAmountValue = getAmountValueFromStr(inputValue, minorUnits);
        if (currentAmountValue !== value) {
            const { majorPart, minorPart } = formatAmount({
                value,
                currency: { code: currency, minority: minorUnits },
            });

            const newFormatedValue = `${majorPart},${minorPart}`;
            return setInputValue(newFormatedValue);
        }

        return () => undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, currency, minorUnits]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const enteredValue = e.target.value.replace(/\s/g, '').replace('.', ',');
        const isCorrectEnteredValue = /(^[0-9]{1,12}(,([0-9]+)?)?$|^\s*$)/.test(enteredValue);

        if (isCorrectEnteredValue) {
            const newFormatedValue = getFormatedValue(enteredValue, currency, minorUnits);

            if (newFormatedValue === inputValue) {
                const caret = e.target.selectionStart;
                const element = e.target;
                window.requestAnimationFrame(() => {
                    element.selectionStart = caret;
                    element.selectionEnd = caret;
                });
            } else {
                /**
                 * Поддержка положения картки
                 * Поскольку при форматировании введенного значения могут появляться символы типа пробела
                 * или запятая - каретка прыгает в конец и ее необходимо ставить в правильное место
                 */

                // TODO: тут полная жопа

                // Узнаем длину оригинального инпута с учловием обрезания лишних символов

                const [head, tail] = e.target.value.split(/\.|,/);
                let l = head.length;
                if (tail) {
                    l += 1;
                    l += tail.slice(0, 2).length;
                }

                const diff = newFormatedValue.length - l;
                const caret = (e.target.selectionStart as number) + diff;
                const element = e.target;
                window.requestAnimationFrame(() => {
                    element.selectionStart = caret;
                    element.selectionEnd = caret;
                });
            }

            setInputValue(newFormatedValue);
            if (onChange) {
                const enteredAmount = {
                    ...amount,
                    value: getAmountValueFromStr(newFormatedValue, minorUnits),
                };
                onChange(e, {
                    amount: enteredAmount,
                    value: '',
                });
            }
        } else {
            // Не двигаем каретку когда вставляется невалидный символ
            const caret = (e.target.selectionStart as number) - 1;
            const element = e.target;
            window.requestAnimationFrame(() => {
                element.selectionStart = caret;
                element.selectionEnd = caret;
            });
        }
    };

    return (
        <Input
            {...restProps}
            label={label}
            value={inputValue}
            rightAddons={<span className={styles.currency}>{currencySymbol}</span>}
            className={className}
            inputClassName={cn(styles.input)}
            onChange={handleChange}
            dataTestId={dataTestId}
        />
    );
};