import { GraphQLError } from "graphql";
import { GraphQLScalarType } from "graphql";
export function AuthenticationError(mensaje = "No autorizado") {
    throw new GraphQLError(mensaje, {
        extensions: {
            code: "UNAUTHENTICATED",
        },
    });
}
export function ApolloError(mensaje = "Error conectando con la base de datos") {
    throw new GraphQLError(mensaje, {
        extensions: {
            code: "INTERNAL_SERVER_ERROR",
        },
    });
}
export function UserInputError(mensaje = "Datos inválidos") {
    throw new GraphQLError(mensaje, {
        extensions: {
            code: "BAD_USER_INPUT",
        },
    });
}
const dateScalar = new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    serialize(value) {
        if (value instanceof Date) {
            return value.toISOString(); // Convert outgoing Date to ISO
        }
        throw Error("GraphQL Date Scalar serializer expected a `Date` object");
    },
    parseValue(value) {
        if (typeof value === "string") {
            return new Date(value); // Convert incoming integer to Date
        }
        throw new Error("GraphQL Date Scalar parser expected a `string`");
    },
});
export const resolvers = {
    Date: dateScalar,
};
