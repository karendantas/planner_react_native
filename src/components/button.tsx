import { 
        TouchableOpacity, 
        TouchableOpacityProps, 
        ActivityIndicator,
        Text, 
        TextProps,
    } from "react-native";

import { createContext, useContext } from "react";

import { clsx } from "clsx";

type Variants = "primary" | "secondary" 

const ThemeContext = createContext<{variant?: Variants}>({});

type ButtonProps = TouchableOpacityProps & {
    variant?: Variants,
    isLoading?: boolean

}
function Button ({children, variant = "primary", isLoading = false, ...rest}:ButtonProps){
    return (
        <TouchableOpacity 
            className={clsx(
                "w-full h-11 flex-row items-center justify-center rounded-lg gap-2",
                {   "bg-lime-300": variant === "primary",
                    "bg-zinc-800": variant === "secondary"
                }
            )}
            disabled = {isLoading}
            activeOpacity={0.7}
            {...rest}
            >
            <ThemeContext.Provider value = { {variant} }>
                { isLoading ? <ActivityIndicator className="text-lime-950"/> : children}
            </ThemeContext.Provider>
        </TouchableOpacity>
    )
}

function Title ({ children }: TextProps){
    const {variant} = useContext(ThemeContext)

    return (
        <Text className={clsx(
                "text-base font-semibold",
                {
                    "text-lime-950": variant === "primary",
                    "text-zinc-200": variant === "secondary",
                }
            )}
        >{children}</Text>
    )
}

Button.title = Title
export { Button }