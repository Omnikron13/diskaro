package com.googlecode.diskaro.library;

import java.sql.*;

public class Genre extends TagCore {
	/**
	 * Returns the name of the primary table used to store genres.
	 * This is primarily so methods such as DataCore.get() can be used.
	 * @return primary table name - "genres"
	 */
	public static String table() {
		return "genres";
	}
	protected String getTable() {
		return table();
	}
	protected String getRelationshipTable() {
		return "subGenres";
	}
	
	public Genre(int id) throws SQLException {
		super(id);
	}
	
	public Genre(String name) throws SQLException {
		super(name);
	}
	
	/**
	 * Adds a new genre entry to the database
	 */
	public static Genre add(String name) throws SQLException {
		return new Genre(add(name, table()));
	}
}
