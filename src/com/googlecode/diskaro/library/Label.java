package com.googlecode.diskaro.library;

import java.sql.*;

public class Label extends TagCore {
	/**
	 * Returns the name of the primary table used to store labels.
	 * This is primarily so methods such as DataCore.get() can be used.
	 * @return primary table name - "labels"
	 */
	public static String table() {
		return "labels";
	}
	protected String getTable() {
		return table();
	}
	protected String getRelationshipTable() {
		return "subLabels";
	}
	
	public Label(int id) throws SQLException {
		super(id);
	}
	
	public Label(String name) throws SQLException {
		super(name);
	}
	
	/**
	 * Adds a new Label entry to the database
	 */
	public static Label add(String name) throws SQLException {
		return new Label(add(name, table()));
	}
}
