/* eslint-disable @typescript-eslint/no-explicit-any */
interface QueryString {
  page?: string;
  limit?: string;
  sort?: string;
  status?: string;
  priority?: string;
  projectId?: string;
}

class PrismaFeatures {
  query: any;
  queryString: QueryString;
  model: any;

  constructor(model: any, queryString: QueryString) {
    this.model = model;
    this.query = {};
    this.queryString = queryString;
  }

  filter(): this {
    const { status, priority } = this.queryString;
    const filters: any = {};

    if (status) {
      filters.status = status;
    }
    if (priority) {
      filters.priority = priority;
    }

    this.query.where = { ...this.query.where, ...filters };
    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map((field) => ({
        [field]: 'asc' as const,
      }));

      this.query.orderBy = sortBy;
    } else {
      this.query.orderBy = { createdAt: 'desc' };
    }

    return this;
  }

  paginate(): this {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 20;
    const skip = (page - 1) * limit;

    this.query.skip = skip;
    this.query.take = limit;
    return this;
  }

  async execute() {
    return this.model.findMany(this.query);
  }
}

export default PrismaFeatures;
