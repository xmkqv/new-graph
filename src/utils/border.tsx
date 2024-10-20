type BorderType = "top" | "right" | "bottom" | "left";

type Border = {
    tileId: string;
    borderType: BorderType;
};

export type { Border, BorderType };
