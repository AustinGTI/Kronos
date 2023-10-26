import React from 'react'


interface AccordionProps {
    children: React.ReactNode
    /**
     * The maximum number of dialogs that can be open at once
     */
    max_open?: number
}

interface AccordionContextProps {
    active_dialogs: string[]
    addDialog: (dialog_id: string) => void
    removeDialog: (dialog_id: string) => void
    dialogIsOpen: (dialog_id: string) => boolean
}

export const AccordionContext = React.createContext<AccordionContextProps>({
    active_dialogs: [],
    addDialog: () => {
    },
    removeDialog: () => {
    },
    dialogIsOpen: () => false,
})

/**
 * Accordion is a wrapper that provides a context to its children that allows them to have a single one open
 * at a time. This is useful for things like settings pages where you want to conserve space and not have
 * multiple dialogs open at once. The context provides a list of active dialogs and a function to add or remove
 * dialogs from the list. When the list overflows, the first dialog in the list is removed. which should trigger a
 * close event on the dialog.
 * @constructor
 */
export default function Accordion({children, max_open = 1}: AccordionProps) {
    const [active_dialogs, setActiveDialogs] = React.useState<string[]>([])

    const addDialog = React.useCallback((dialog_id: string) => {
        // if dialog is not already in active_dialogs
        if (!active_dialogs.includes(dialog_id)) {
            setActiveDialogs((dialogs) => {
                if (dialogs.length >= max_open) {
                    dialogs.shift()
                }
                return [...dialogs, dialog_id]
            })
        }
    }, [max_open, setActiveDialogs, active_dialogs])

    const removeDialog = React.useCallback((dialog_id: string) => {
        if (active_dialogs.includes(dialog_id)) {
            setActiveDialogs((dialogs) => dialogs.filter((id) => id !== dialog_id))
        }
    }, [active_dialogs, setActiveDialogs])

    const dialogIsOpen = React.useCallback((dialog_id: string) => {
        return active_dialogs.includes(dialog_id)
    }, [active_dialogs])

    const context: AccordionContextProps = React.useMemo(() => {
        return {
            active_dialogs,
            addDialog,
            removeDialog,
            dialogIsOpen,
        }
    }, [active_dialogs, addDialog, removeDialog, dialogIsOpen]);

    return (
        <AccordionContext.Provider value={context}>
            {children}
        </AccordionContext.Provider>
    );
}
